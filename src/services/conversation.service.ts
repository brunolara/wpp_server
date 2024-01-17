import {Conversation} from "../models/conversation";
import {Message} from "../models/message";
import {Message as WppMessage, MessageAck} from 'whatsapp-web.js';
import {getContactFromNumber, getMedia, getMediaFromBase64, sendMessage} from "../wpp";
import {generateFileName, saveBaseToFile} from "../helpers/file.helper";
import ConfigService, {CONFIGURATION} from "./config.service";
import {Webhook} from "../models/webhook";
import axios from "axios";
import {WebhookType} from "../DTO/Webhook";
import WebhookService from "./webhook.service";

class ConversationService {
    async saveSentMessage(to: string, body: string, filePath: string | null = null, messageId: string, wppMessageId?: string){
        try {
            const conversation = await Conversation.findOne({
                where: {
                    user_number: to
                }
            });

            let conversationId;

            if(conversation){
                conversationId = conversation.id;
                conversation.lastInteractionDate = new Date();
                await conversation.save();
            }
            else {
                const c = Conversation.build({
                    isUserStarted: false,
                    userNumber: to,
                    lastInteractionDate: new Date(),
                    currentNumber: await ConfigService.get(CONFIGURATION.CURRENT_PHONE_NUMBER),
                });
                await c.save();
                conversationId = c.id;
            }

            return await Message.create({
                conversationId: conversationId,
                message: body,
                messageFilePath: filePath,
                isUser: false,
                messageId,
                wppMessageId
            })
        } catch (e){
            return null
        }
    }

    async handleBase64FileMessage(base64File: string, mimeType: string, fileName: string, to: string, messageId: string){
        const contactId = await getContactFromNumber(to);
        if(!contactId) {
            await this.handleNumberCheck(to, messageId, false);
            return null;
        }
        const generatedName = generateFileName(fileName);
        const pathToSave = `${contactId.user}/${generatedName}`;
        const message = await getMediaFromBase64(base64File, fileName, mimeType);
        const localPath = await saveBaseToFile(pathToSave, mimeType, base64File);
        if(message) {
            const messageResponse = await sendMessage(to, message);
            const wppMessageId = messageResponse?.id._serialized;
            await this.saveSentMessage(contactId?.user ?? '', '', localPath, messageId, wppMessageId);
            return messageResponse;
        }
        return null;
    }

    async handleFileUrl(fileUrl: string, filename: string, to: string, messageId: string){
        const contactId = await getContactFromNumber(to);
        if(!contactId) {
            await this.handleNumberCheck(to, messageId, false);
            return null;
        }
        const message = await getMedia(fileUrl, filename);
        if(message) {
            const messageResponse = await sendMessage(to, message);
            const wppMessageId = messageResponse?.id._serialized;
            await this.saveSentMessage(contactId?.user ?? '', '', fileUrl, messageId, wppMessageId);
            return messageResponse;
        }
        return null;
    }

    async handlePlainMessage(body: string, to: string, messageId: string){
        const contactId = await getContactFromNumber(to);
        if(!contactId) {
            await this.handleNumberCheck(to, messageId, false);
            return null;
        }
        const messageResponse = await sendMessage(to, body);
        const wppMessageId = messageResponse?.id._serialized;
        if(messageResponse) {
            await this.saveSentMessage(contactId?.user ?? '', body, null, messageId, wppMessageId);
            return messageResponse;
        }
        return null;
    }

    async handleNumberCheck(number: string, messageId?: string, valid?: boolean){
        if(valid === undefined) valid = !!(await getContactFromNumber(number));
        await WebhookService.addNumberCheckToQueue(number, messageId, valid);
    }

    async getMessageById(id: string){
        return await Message.findOne({
            where: {messageId: id}
        });
    }
}

export default new ConversationService()
