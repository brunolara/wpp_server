import WppStateService, {EventReaction} from "./wpp.state.service";
import {Client, MessageMedia, WAState} from "whatsapp-web.js";
import WebhookService from "./webhook.service";
import qrcode from "qrcode-terminal";
import {v4 as uuidv4} from "uuid";
import {MainQueue} from "../queue/main";
import {MessageType} from "../DTO/Message";
import {Session} from "../models/session";

export interface MessageRequest{
    to: string,
    base64File?: string,
    fileUrl?: string,
    mimeType?: string,
    fileName?: string,
    body?: string,
    id?: number,
}

export interface ResponseItem{
    messageId: string,
    success: boolean,
    errorMessage: string,
    id?: number
}

export class WppService{
    client: Client;
    phoneNumber: string;
    sessionId: number;
    currentStatus: WAState | string;
    constructor(sessionId: number, client: Client, phoneNumber: string) {
        this.sessionId = sessionId;
        this.client = client;
        this.phoneNumber = phoneNumber;
        this.currentStatus = WAState.UNLAUNCHED;
        this.client = client;
    }

    async setStatus(state?: WAState | string){
        if(!state) state = await this.client.getState() ?? WAState.UNLAUNCHED;
        await WppStateService.setWppSessionStatus(this.sessionId, state);
    }

    async setQrCode(qrcode?: String){
        await WppStateService.setQrCode(this.sessionId, qrcode);
    }

    async listenEvents (sessionId: number){
        await this.setQrCode();
        if(!this.client) {
            throw new Error("Session not found");
        }
        const keys = Object.keys(this.eventReactions);
        for(let i = 0; i < keys.length; i++){
            const key = keys[i] as keyof EventReaction;
            this.client.on(keys[i], this.eventReactions[key]);
        }
    }

    onQR = async (qr: string) => {
        await WebhookService.addStatusToQueue('QR_CODE', this.sessionId, qr);
        await this.setStatus("QR_CODE");
        await this.setQrCode(qr);
        qrcode.generate(qr, {small: true});
        console.log(`${this.sessionId} - qr`)
    }

    onChangeState = async (state: string) => {
        await this.setStatus();
        await WebhookService.addStatusToQueue(state.toUpperCase(), this.sessionId)

        console.log(`${this.sessionId} - ${this.currentStatus}`, 'oi');
    }

    onMessageAck = async (message: any) => {
        await WebhookService.addMessageStatusToQueue(message)
    }

    async getMedia(url:string, fileName: string):Promise<MessageMedia | null>{
        try {
            return await MessageMedia.fromUrl(url,{
                unsafeMime: true,
                filename: fileName,
            });
        } catch (e){
            return null;
        }
    }

    async getMediaFromBase64(data: string, fileName: string, mimeType: string):Promise<MessageMedia | null>{
        try {
            return await new MessageMedia(mimeType, data, fileName)
        } catch (e){
            return null;
        }
    }

    async sendMessage(to: string, body: string | MessageMedia, caption: string | null = null){
        try {
            if(await this.client.getState() !== WAState.CONNECTED) return null;
            const contactId = await this.client.getNumberId(to);
            if(contactId == null) {
                return null;
            }
            return await this.client.sendMessage(
                `${contactId.user}@${contactId.server}`,
                body, {caption: caption ?? ''}
            );
        } catch (e){
            return null;
        }
    }

    async getContactFromNumber(number:string){
        try {
            if(await this.client.getState() !== WAState.CONNECTED) return null;
            const contactId = await this.client.getNumberId(number);
            if(!contactId) return null;
            return contactId;
        } catch (e){
            return null;
        }
    }

    static async processMessage(request: MessageRequest, sessionData: Session){
        const {
            to = '',
            body = null,
            id = undefined,
            base64File = null,
            fileUrl = null,
        } = request as MessageRequest;
        if(base64File || fileUrl){
            return await WppService.sendFile(request, sessionData);
        }
        else {
            const responseItem: ResponseItem = {messageId: '', success: false, errorMessage: '', id};
            if (!body || body.length === 0) {
                responseItem.errorMessage = 'Mensagem vazia';
                return responseItem
            }

            responseItem.messageId = uuidv4();

            await MainQueue.add(`${to.trim()}_${new Date().getTime()}`,
                {
                    to: to.trim(),
                    body,
                    type: MessageType.PLAIN,
                    messageId: responseItem.messageId,
                    sessionData: sessionData
                }
            );

            responseItem.success = true;
            return responseItem;
        }
    }

    static async sendFile(data: MessageRequest, sessionData: Session): Promise<ResponseItem> {
        const messageId = uuidv4();
        const {
            to = '',
            base64File = null,
            fileUrl = null,
            mimeType = null,
            fileName = null,
            body = null,
            id,
        } = data;
        if(!base64File && !fileUrl && !body)
            return {messageId, success: false, errorMessage: 'Mensagem vazia', id};
        if(base64File) {
            if (!mimeType){
                return {
                    messageId,
                    success: false,
                    errorMessage: 'Arquivos em base64 precisam ter o mimeType',
                    id
                }
            }
            if (!fileName){
                return {
                    messageId,
                    success: false,
                    errorMessage: 'Arquivos em base64 precisam ter um nome: nome.extensão',
                    id
                }
            }
            await MainQueue.add(`${to.trim()}_${new Date().getMilliseconds()}`,
                {base64File, mimeType, fileName, to: to.trim(), type: MessageType.BASE64, messageId, sessionData, id},
            );
        }
        else if(fileUrl){
            if (!fileName){
                return {
                    messageId,
                    success: false,
                    errorMessage: 'Arquivos em URL precisam ter um nome: nome.extensão'
                }
            }
            await MainQueue.add(`${to.trim()}_${new Date().getMilliseconds()}`,
                {fileUrl, fileName, to: to.trim(), type: MessageType.REMOTE, messageId, sessionData, id},
            );
        }
        return {messageId, success: true, errorMessage: '', id};
    }


    public eventReactions: EventReaction = {
        "qr": this.onQR,
        "authenticated": async() => await this.onChangeState("authenticated"),
        "auth_failure": async() => await this.onChangeState("auth_failure"),
        "ready": async() => await this.onChangeState("ready"),
        "message_ack": this.onMessageAck,
    };

}
