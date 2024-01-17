import WppStateService, {EventReaction} from "./wpp.state.service";
import {Client, WAState} from "whatsapp-web.js";
import WebhookService from "./webhook.service";

export class WppService{
    client: Client;
    phoneNumber: string;
    sessionId: number;
    currentStatus: WAState;
    constructor(sessionId: number, client: Client, phoneNumber: string) {
        this.sessionId = sessionId;
        this.client = client;
        this.phoneNumber = phoneNumber;
        this.currentStatus = WAState.UNLAUNCHED;
        this.client = client;
    }

    async setStatus(state?: WAState){
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
        await this.setStatus();
        await this.setQrCode(qr);
        console.log(`${this.sessionId} - qr`)
    }

    onChangeState = async () => {
        this.setStatus().then(() => {
            console.log(`${this.sessionId} - ${this.currentStatus}`)
        }).catch((err) => console.log(err));
    }

    onMessageAck = async (message: any) => {
        WebhookService.addMessageStatusToQueue(message)
    }


    public eventReactions: EventReaction = {
        "qr": this.onQR,
        "authenticated": this.onChangeState,
        "auth_failure": this.onChangeState,
        "ready": this.onChangeState,
        "message_ack": this.onMessageAck,
    };

}
