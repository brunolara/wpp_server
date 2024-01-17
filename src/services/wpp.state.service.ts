import {Client, LocalAuth, WAState} from "whatsapp-web.js";
import path from "path";
import {Session} from "../models/session";
import WebhookService from "./webhook.service";
import {WppService} from "./wpp.service";

export interface EventReaction{
    [key: string]: (...args: any[]) => void;
}

class WppStateService {
    sessions: WppService[] = [];


    async createWppSession(s: Session){
        if(this.sessions.find(session => session.sessionId === s.id)) return;
        const clientId = `session-${s.id}`;
        const client = new Client({
            authStrategy: new LocalAuth({
                dataPath: path.resolve("./session"),
                clientId
            })
        });

        client.initialize();
        const sessionService = new WppService(s.id, client, s.phone_number);

        await sessionService.listenEvents(s.id);

        this.sessions.push(sessionService);
        return sessionService;
    }

    async restartSession(sessionId: number){
        const session = this.sessions.find(session => session.sessionId === sessionId);
        if(!session) return;
        await session.client.destroy();
        await session.client.initialize();
    }

    async startAll(){
        const sessions = await Session.findAll();
        const promises = sessions.map(session => {
            return this.createWppSession(session);
        });
        console.log(sessions)
        return Promise.all(promises);
    }

    getWppSession(sessionId: number): WppService | undefined{
        return this.sessions.find(session => session.sessionId === sessionId);
    }

    async setWppSessionStatus(sessionId: number, status: WAState | string){
        const session = this.sessions.find(session => session.sessionId === sessionId);
        if(!session) return;
        session.currentStatus = status;
        await Session.update({
            wpp_status: status
        }, {
            where: {
                id: sessionId
            }
        });
    }

    async setQrCode(sessionId: number, qrcode?: String){
        const session = this.sessions.find(session => session.sessionId === sessionId);
        if(!session) return;
        await Session.update({
            qr_code: qrcode ?? null
        }, {
            where: {
                id: sessionId
            }
        });
    }

}

const wppStateService = new WppStateService();

export default wppStateService;
