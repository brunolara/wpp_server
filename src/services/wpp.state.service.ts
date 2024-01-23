import {Client, LocalAuth, WAState} from "whatsapp-web.js";
import path from "path";
import {Session} from "../models/session";
import {WppService} from "./wpp.service";
import webhookService from "./webhook.service";

export interface EventReaction{
    [key: string]: (...args: any[]) => void;
}

class WppStateService {
    sessions: WppService[] = [];


    async createWppSession(s: Session){
        if(this.sessions.find(session => session.sessionId === s.id)){
            console.log("session already exists", " - Recreating session")
            await this.restartSession(s.id);
            return;
        }
        const clientId = `session-${s.id}`;
        const client = new Client({
            authStrategy: new LocalAuth({
                dataPath: path.resolve("./session"),
                clientId
            })
        });

        client.initialize();
        const sessionService = new WppService(s.id, client, s.phone_number);

        await sessionService.listenEvents();

        this.sessions.push(sessionService);
        return sessionService;
    }

    async restartSession(sessionId: number){
        const session = this.sessions.find(session => session.sessionId === sessionId);
        if(!session) return;
        const currentState = await session.client.getState();
        if(!currentState) return;
        await webhookService.addStatusToQueue(WAState.UNLAUNCHED, sessionId);
        await this.setWppSessionStatus(sessionId, WAState.UNLAUNCHED);
        await session.client.destroy();
        await session.client.initialize();
    }

    async startAll(){
        const sessions = await Session.findAll({
            where: {
                wpp_status: 'CONNECTED'
            }
        });
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
            wpp_status: status,
            updatedAt: new Date()
        }, {
            where: {
                id: sessionId
            }
        });
    }

    async setQrCode(sessionId: number, qrcode?: String){
        const session = this.sessions.find(session => session.sessionId === sessionId);
        if(!session || !qrcode) return;
        await Session.update({
            qr_code: qrcode,
            updatedAt: new Date(),
            wpp_status: 'QR_CODE'
        }, {
            where: {
                id: sessionId
            }
        });
    }

}

const wppStateService = new WppStateService();

export default wppStateService;
