import {Request, Response} from "express";
import ConversationService from "../services/conversation.service";

import {ResponseItem, WppService} from "../services/wpp.service";
import wppStateService from "../services/wpp.state.service";
import {WAState} from "whatsapp-web.js";
import sessionService from "../services/session.service";
import {MainQueue} from "../queue/main";
import {MessageType} from "../DTO/Message";
import {CheckNumber} from "../DTO/CheckNumber";

class MainController{
    async sendMessage(req: Request, res: Response){
        const response: ResponseItem = await WppService.processMessage(req.body, req.context);

        if(!response.success)
            return res.status(422).json({error: response.errorMessage, messageId: response.messageId});
        return res.status(200).json({messageId: response.messageId});
    }


    async sendBulk(req: Request, res: Response){
        const data = req.body;
        if(!Array.isArray(data)){
            return res.status(422).json({'error': 'O corpo precisa ser um array'});
        }
        const promises = data.map(async (item: any, index) => {
            item.id = item.id ?? index;
            return WppService.processMessage(item, req.context)
        });
        const response = await Promise.all(promises);
        return res.status(200).json(response);
    }

    async getMessage(req: Request, res: Response){
        try {
            const {messageId = ''} = req.params;
            return res.json(await ConversationService.getMessageById(messageId));
        } catch (e: any) {
            return res.sendStatus(500).json({error: e?.message});
        }
    }

    async checkNumberBulk(req: Request, res: Response){
        const data: CheckNumber[] = req.body;
        const errorList: ({success: boolean, error?: string} & CheckNumber)[] = [];
        if(!Array.isArray(data)){
            return res.status(422).json({'error': 'O corpo precisa ser um array'});
        }
        const jobs = data.map((item) => {
            const name = `${item.number.trim()}_${new Date().getTime()}`;
            const {number, id} = item;
            if(!number) {
                errorList.push({success: false, error: 'Número não informado', ...item});
                return {name, data: null};
            }
            errorList.push({success: true, ...item});
            return  {
                name,
                data: {
                    number: number.trim(),
                    id,
                    sessionData: req.context,
                    type: MessageType.CHECK_NUMBER,
                }
            };
        });
        await MainQueue.addBulk(jobs.filter(i => i.data != null));
        return res.status(200).json(errorList);
    }

    async getState(req: Request, res: Response){
        const session = wppStateService.getWppSession(req.context.id);
        if(!session) return res.json({status: "A máquina não está conectada, use o endpoint /start para iniciar"});
        const status = (await session.client?.getState()) ?? WAState.UNPAIRED
        return res.json({status});
    }

    start(req: Request, res: Response){
        wppStateService.createWppSession(req.context);
        return res.sendStatus(200);
    }

    async stop(req: Request, res: Response){
        const session = wppStateService.getWppSession(req.context.id);
        await session?.setStatus('DISABLED');
        await wppStateService.stopSession(req.context);
        return res.sendStatus(200);
    }

    async qr(req: Request, res: Response){
        const qr = await sessionService.getQrCode(req.query.apikey?.toString() ?? '');
        return res.render('qrcode', {qr});
    }
}

export default new MainController();
