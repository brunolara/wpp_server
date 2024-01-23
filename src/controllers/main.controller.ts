import {Request, Response} from "express";
import ConversationService from "../services/conversation.service";
import {MainQueue} from "../queue/main";
import {MessageType} from "../DTO/Message";
import { v4 as uuidv4 } from 'uuid';
import {MessageRequest, ResponseItem, WppService} from "../services/wpp.service";
import {Session} from "../models/session";

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
}

export default new MainController();
