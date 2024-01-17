import WppStateService, {EventReaction} from "./wpp.state.service";
import {Client, MessageMedia, WAState} from "whatsapp-web.js";
import WebhookService from "./webhook.service";
import qrcode from "qrcode-terminal";

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


    public eventReactions: EventReaction = {
        "qr": this.onQR,
        "authenticated": async() => await this.onChangeState("authenticated"),
        "auth_failure": async() => await this.onChangeState("auth_failure"),
        "ready": async() => await this.onChangeState("ready"),
        "message_ack": this.onMessageAck,
    };

}
