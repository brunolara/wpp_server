import {Request, Response} from "express";
import ConversationService from "../services/conversation.service";
import {MainQueue} from "../queue/main";
import {queue} from '../config/config.json';
import {Job} from "bullmq";
import {Base64Message, MessageType, PlainMessage, RemoteFileMessage} from "../DTO/Message";
import { v4 as uuidv4 } from 'uuid';

class MainController{
    async sendPlain(req: Request, res: Response){
        const {to = '', body} = req.body;
        const messageId = uuidv4();
        if (!body || body.length === 0)
            return res.status(422).json({'error': 'Mensagem vazia'});
        await MainQueue.add(`${to.trim()}_${new Date().getTime()}`,
            {to: to.trim(), body, type: MessageType.PLAIN, messageId, sessionData: req.context}
        );
        return res.status(200).json({messageId});
    }

    async sendBulk(req: Request, res: Response){
        const data = req.body;
        if(!Array.isArray(data)){
            return res.status(422).json({'error': 'O corpo precisa ser um array'});
        }
        const promises = data.map(async (item: any) => {
            const {to = '', body = null} = item;
            const messageId = uuidv4();
            const responseItem = {messageId: '', success: false, errorMessage: ''};
            if (!body || body.length === 0){
                responseItem.errorMessage = 'Mensagem vazia';
                return responseItem
            }
            responseItem.messageId = messageId;
            await MainQueue.add(`${to.trim()}_${new Date().getTime()}`,
                {to: to.trim(), body, type: MessageType.PLAIN, messageId, sessionData: req.context}
            );
            responseItem.success = true;
            return responseItem;
        });
        const response = await Promise.all(promises);
        return res.status(200).json(response);
    }

    async sendFile(req: Request, res: Response){
        const {
            to = '',
            base64File = null,
            fileUrl = null,
            mimeType = null,
            fileName = null,
            body = null
        } = req.body;
        const messageId = uuidv4();
        if(!base64File && !fileUrl && !body)
            return res.status(422).json({'error': 'Mensagem vazia'});
        if(base64File) {
            if (!mimeType)
                return res.status(422).json(
                    {'error': 'Arquivos em base64 precisam ter o mimeType'}
                );
            if (!fileName)
                return res.status(422).json(
                    {'error': 'Arquivos em base64 precisam ter um nome: nome.extensão'}
                );

            await MainQueue.add(`${to.trim()}_${new Date().getMilliseconds()}`,
                {base64File, mimeType, fileName, to: to.trim(), type: MessageType.BASE64, messageId, sessionData: req.context},
            );
        }
        else if(fileUrl){
            if (!fileName)
                return res.status(422).json(
                    {'error': 'Arquivos em URL precisam ter um nome: nome.extensão'}
                );
            await MainQueue.add(`${to.trim()}_${new Date().getMilliseconds()}`,
                {fileUrl, fileName, to: to.trim(), type: MessageType.REMOTE, messageId, sessionData: req.context},
            );
        }
        return res.status(200).json({messageId});
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
