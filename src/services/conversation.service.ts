import {Conversation} from "../models/conversation";
import {Message} from "../models/message";
import {getContactFromNumber, getMedia, getMediaFromBase64, sendMessage} from "../wpp";
import {generateFileName, saveBaseToFile} from "../helpers/file.helper";
import ConfigService, {CONFIGURATION} from "./config.service";
import {ContactId} from "whatsapp-web.js";

class ConversationService {
    async saveSentMessage(to: string, body: string, filePath: string | null = null){
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
            })
        } catch (e){
            console.log(e)
            return null
        }
    }

    async handleBase64FileMessage(base64File: string, mimeType: string, fileName: string, to: string){
        const contactId = await getContactFromNumber(to);
        if(!contactId) return null;
        const generatedName = generateFileName(fileName);
        const pathToSave = `${contactId.user}/${generatedName}`;
        const message = await getMediaFromBase64(base64File, fileName, mimeType);
        const localPath = await saveBaseToFile(pathToSave, mimeType, base64File);
        console.log(localPath);
        if(message) {
            const messageResponse = await sendMessage(to, message);
            await this.saveSentMessage(contactId?.user ?? '', '', localPath);
            return messageResponse;
        }
        return null;
    }

    async handleFileUrl(fileUrl: string, filename: string, to: string){
        const message = await getMedia(fileUrl, filename);
        if(message) {
            const contactId = await getContactFromNumber(to);
            const messageResponse = await sendMessage(to, message);
            await this.saveSentMessage(contactId?.user ?? '', '', fileUrl);
            return messageResponse;
        }
        return null;
    }

    async handlePlainMessage(body: string, to: string){
        const messageResponse = await sendMessage(to, body);
        if(messageResponse) {
            const contactId = await getContactFromNumber(to);
            await this.saveSentMessage(contactId?.user ?? '', body);
            return messageResponse;
        }
        return null;
    }
}

export default new ConversationService()
