import {Request, Response} from "express";
import ConversationService from "../services/conversation.service";
import {MainQueue} from "../queue";
import {queue} from '../config/config.json';
import {Job} from "bullmq";
import {Base64Message, MessageType, PlainMessage, RemoteFileMessage} from "../DTO/Message";

class MainController{
    async sendPlain(req: Request, res: Response){
        const {to, body} = req.body;
        if (!body || body.length === 0)
            return res.status(422).json({'error': 'Mensagem vazia'});

        await MainQueue.add(`${to}_${new Date().getTime()}`,
                {to, body, type: MessageType.PLAIN},
                queue.jobOptions
            );
        return res.status(200).json({});
    }

    async sendFile(req: Request, res: Response){
        const {
            to,
            base64File = null,
            fileUrl = null,
            mimeType = null,
            fileName = null,
            body = null
        } = req.body;
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

            await MainQueue.add(`${to}_${new Date().getMilliseconds()}`,
                {base64File, mimeType, fileName, to, type: MessageType.BASE64},
                queue.jobOptions
            );
        }
        else if(fileUrl){
            if (!fileName)
                return res.status(422).json(
                    {'error': 'Arquivos em URL precisam ter um nome: nome.extensão'}
                );
            await MainQueue.add(`${to}_${new Date().getMilliseconds()}`,
                {fileUrl, fileName, to, type: MessageType.REMOTE},
                queue.jobOptions
            );
        }
        return res.status(200).json({});
    }

    async workController(job: Job){
        console.log(`${job.name} started`);
        if(job.data.type === MessageType.PLAIN){
            const data: PlainMessage = job.data;
            await ConversationService.handlePlainMessage(data.body.toString(), data.to);
        }

        if(job.data.type === MessageType.BASE64){
            const data: Base64Message = job.data;
            await ConversationService.handleBase64FileMessage(data.base64File, data.mimeType, data.fileName, data.to);
        }

        if(job.data.type === MessageType.REMOTE){
            const data: RemoteFileMessage = job.data;
            await ConversationService.handleFileUrl(data.fileUrl, data.fileName, data.to);
        }

        return true;
    }
}

export default new MainController();
