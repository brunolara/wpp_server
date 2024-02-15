import {Conversation} from "../models/conversation";
import {Message} from "../models/message";
import {generateFileName, saveBaseToFile} from "../helpers/file.helper";
import ConfigService, {CONFIGURATION} from "./config.service";
import WebhookService from "./webhook.service";
import {WppService} from "./wpp.service";
import webhookService from "./webhook.service";
import {MessageMedia, Message as WppMessage} from "whatsapp-web.js";
import {MessageSaveDTO} from "../DTO/Message";
import {v4 as uuidv4} from "uuid";
import {ContactService} from "./contact.service";

class ConversationService {
    session: WppService;
    contactService: ContactService;
    constructor(session: WppService) {
        this.session = session;
        this.contactService = new ContactService(session);
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

    async saveMessage(data: MessageSaveDTO){
        try {
            const {
                to,
                from,
                body,
                filePath = null,
                messageId,
                wppMessageId,
                isUser = false,
            } = data;
            // se o to for nulo a msg é do usuário
            const userNumber = isUser ? from : to;
            if(!userNumber) return null;

            const contactId = await this.contactService.saveContact(userNumber);
            const conversation = await Conversation.findOne({
                where: {
                    contact_id: contactId.id,
                    session_id: this.session.sessionId
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
                    sessionId: this.session.sessionId,
                    isUserStarted: isUser,
                    contactId: contactId.id,
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
                isUser,
                messageId,
                wppMessageId
            })
        } catch (e){
            return null
        }
    }

    async handleBase64FileMessage(base64File: string, mimeType: string, fileName: string, to: string, body: string, messageId: string){
        const contactId = await this.session.getContactIdFromNumber(to);
        if(!contactId) {
            await this.contactService.invalidateContact(to);
            return null;
        }
        const pathToSave = `${contactId.user}`;
        const message = await this.getMediaFromBase64(base64File, fileName, mimeType);
        const localPath = await saveBaseToFile(pathToSave, mimeType, base64File);
        if(message) {
            const messageResponse = await this.session.sendMessage(to, message, body);

            if(messageResponse){
                const chat = await messageResponse.getChat();
                const contact = await chat.getContact();
                await this.contactService.updateContact(contactId.user, contact);
                const wppMessageId = messageResponse?.id._serialized;
                const messageDto: MessageSaveDTO = {
                    to: contactId.user,
                    body,
                    filePath: localPath,
                    messageId,
                    wppMessageId,
                    isUser: false
                };
                await this.saveMessage(messageDto);
                return messageResponse;
            }
        }
        await webhookService.addSendMessageErrorQueue(messageId, this.session.sessionId, 'Error on get media from base64')
        return null;
    }

    async handleFileUrl(fileUrl: string, filename: string, to: string, body: string, messageId: string){
        const contactId = await this.session.getContactIdFromNumber(to);
        if(!contactId) {
            await this.contactService.invalidateContact(to);
            return null;
        }
        const message = await this.getMedia(fileUrl, filename);
        if(message) {
            const messageResponse = await this.session.sendMessage(to, message, body);

            if(messageResponse){
                const chat = await messageResponse.getChat();
                const contact = await chat.getContact();
                await this.contactService.updateContact(contactId.user, contact);
                const wppMessageId = messageResponse?.id._serialized;
                const messageDto: MessageSaveDTO = {
                    to: contactId.user,
                    body,
                    filePath: fileUrl,
                    messageId,
                    wppMessageId,
                    isUser: false
                };
                await this.saveMessage(messageDto);
                return messageResponse;
            }
        }
        await webhookService.addSendMessageErrorQueue(messageId, this.session.sessionId, 'Error on get media from url')
        return null;
    }

    async handlePlainMessage(body: string, to: string, messageId: string){
        const contactId = await this.session.getContactIdFromNumber(to);
        if(!contactId) {
            await this.contactService.invalidateContact(to);
            return null;
        }
        const messageResponse = await this.session.sendMessage(to, body);
        const wppMessageId = messageResponse?.id._serialized;
        if(messageResponse) {
            const chat = await messageResponse.getChat();
            const contact = await chat.getContact();
            await this.contactService.updateContact(contactId.user, contact);

            const messageDto: MessageSaveDTO = {
                to: contactId.user,
                body,
                messageId,
                wppMessageId,
                isUser: false
            };
            await this.saveMessage(messageDto);
            console.log("Mensagem salva", body);
            return messageResponse;
        }
        await webhookService.addSendMessageErrorQueue(messageId, this.session.sessionId, 'Error on send message')
        return null;
    }

    static async getMessageById(id: string){
        return await Message.findOne({
            where: {messageId: id}
        });
    }

    async onMessage(message: WppMessage){
        const chat = await message.getChat();
        if(chat.isGroup) return;
        const wppContact = await chat.getContact();
        await this.contactService.updateContact(message.from.split('@')[0], wppContact);
        const {from, body, id} = message;
        const media = message.hasMedia ? await message.downloadMedia() : null;
        let fileUrl = null;
        if(media) {
            fileUrl = await saveBaseToFile(from.split('@')[0], media.mimetype, media.data);
        }
        const messageDto: MessageSaveDTO = {
            from: from.split('@')[0],
            body: body,
            filePath: fileUrl,
            messageId: uuidv4(),
            wppMessageId: id._serialized,
            isUser: true
        };
        const savedMessage= await this.saveMessage(messageDto);

        if(savedMessage) {
            const message = await Message.findByPk(savedMessage.id, {
                include: {
                    model: Conversation,
                    as: 'conversation',
                    include: ['contact']
                }
            })
            webhookService.addUserMessageToQueue(message!, this.session.sessionId);
        }
    }

}

export default ConversationService;
