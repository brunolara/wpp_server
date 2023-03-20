import {Request, Response} from "express";
import ConversationService from "../services/conversation.service";

class MainController{
    async sendPlain(req: Request, res: Response){
        const {to, body} = req.body;
        if (!body || body.length === 0)
            return res.status(422).json({'error': 'Mensagem vazia'});
        const messageResponse =
            await ConversationService.handlePlainMessage(body.toString(), to);

        return messageResponse ?
            res.status(200).json(messageResponse) :
            res.status(500).json({'error' : 'Não consegui enviar a mensagem'});
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
        let messageResponse = null;
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
            messageResponse =
                await ConversationService.handleBase64FileMessage(base64File, mimeType, fileName, to);
        }
        else if(fileUrl){
            if (!fileName)
                return res.status(422).json(
                    {'error': 'Arquivos em URL precisam ter um nome: nome.extensão'}
                );
            messageResponse =
                await ConversationService.handleFileUrl(fileUrl, fileName, to);
        }
        return messageResponse ?
            res.status(200).json(messageResponse) :
            res.status(500).json({'error' : 'Não consegui enviar a mensagem'});
    }
}

export default new MainController();
