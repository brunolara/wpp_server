import {Message} from "../models/message";
import {Message as WppMessage, MessageAck} from "whatsapp-web.js";
import {Webhook} from "../models/webhook";
import axios, {AxiosError} from "axios";
import {WebhookType} from "../DTO/Webhook";
import {WebhookQueue} from "../queue/main";
import {queue} from '../config/config.json';
import {WebhookHistory} from "../models/webhookHistory";
import {URL} from "url";

class WebhookService{
    stringIsAValidUrl(s: string | null){
        try {
            if(typeof s !== 'string') return false;
            new URL(s);
            return true;
        } catch (err) {
            return false;
        }
    }
    async getMessageByWppId(wppMessageId: string){
        return await Message.findOne({
            include: ['conversation'],
            where: {
                wppMessageId
            }
        });
    }

    async callSessionWebhook(sessionId: number, event: any){
        const historyData = ({
            webhookId: 0,
            httpResponse: 0,
            messageId: event.message?.id ?? null,
            eventData: event ?? {},
        });
        try{
            const webhook = await Webhook.findOne({
                where: {'status': 'active', session_id: sessionId}
            });

            if(!webhook || !webhook.url || !this.stringIsAValidUrl(webhook.url)) return true;

            historyData.webhookId = webhook?.id ?? 0;

            const response = await axios.post(webhook.url, event, {timeout: 15000});
            historyData.httpResponse = response.status;
            await WebhookHistory.create(historyData);
            return true;

        } catch (e){
            console.log(e)
            if(e instanceof AxiosError) {
                historyData.httpResponse = e.status ?? 0;
                await WebhookHistory.create(historyData);
            }
            return false;
        }
    }

    addStatusToQueue(status: string, sessionId: number, data: any = {}){
        return WebhookQueue.add(`conn_status_${status}_${sessionId}_${new Date().getTime()}`,
            {status, type: WebhookType.CONN_STATUS, sessionId, data},
            queue.webhookJobOptions
        );
    }
    async sendConStatus(status: string, sessionId :number, data: any = {}){
        const event = {type: 'conn_status', status, data};
        return await this.callSessionWebhook(sessionId, event);
    }

    async addSendMessageErrorQueue(messageId: string, sessionId: number, error: any){
        await WebhookQueue.add(`send_message_error_${messageId}_${new Date().getTime()}`,
            {messageId, type: WebhookType.SEND_MESSAGE_ERROR, error, sessionId},
            queue.webhookJobOptions
        );
    }

    async sendSendMessageError(messageId: string, sessionId: number, error: any){
        const message = await Message.findOne({where: {message_id: messageId}});
        const event = {
            type: 'send_message_error',
            error,
            messageId,
            message: message?.toJSON()
        };
        return await this.callSessionWebhook(sessionId, event)
    }

    async sendMessageStatusNotification(message: WppMessage, status?: MessageAck, creationTimeStamp?: number){
        const currentMessage = (await this.getMessageByWppId(message.id._serialized));
        /* direct messages only */
        if(!currentMessage) {
            if(message.fromMe){
                //retente depois
                return false;
            }
            return true;
        }

        currentMessage.wppMessageStatus = message.ack;
        await currentMessage.save();

        const event = {
            type: 'message_ack',
            ack: status ?? message.ack,
            message: currentMessage.toJSON(),
            messageId: currentMessage.messageId,
            creationTimeStamp
        };
        return await this.callSessionWebhook(currentMessage.conversation?.sessionId ?? 0, event)
    }

    async addNumberCheckToQueue(contact: any, sessionId: number, status: boolean = true, requestId?: number){
        await WebhookQueue.add(`number_check_${contact.rawNumber}_${new Date().getTime()}`,
            {contact, type: WebhookType.NUMBER_CHECK, sessionId, status, id: requestId},
            queue.webhookJobOptions
        );
    }

    async addMessageStatusToQueue(msg: WppMessage){
        await WebhookQueue.add(`ack_${msg.id._serialized}_${msg.ack}`,
            {message:msg, type: WebhookType.MESSAGE_ACK},
            {...queue.webhookJobOptions, delay: 1000}
        );
    }

    async sendValidateNumber(contact: any, sessionId: number, status: boolean, requestId?: number){
        const event = {type: WebhookType.NUMBER_CHECK, contact, status, id: requestId};
        return await this.callSessionWebhook(sessionId, event);
    }

    async addUserMessageToQueue(message: Message, sessionId: number){
        await WebhookQueue.add(`user_message_${message.id}_${new Date().getTime()}`,
            {message, type: WebhookType.USER_MESSAGE, sessionId},
            queue.webhookJobOptions
        );
    }

    async sendUserMessage(message: Message, sessionId: number){
        const event = {type: WebhookType.USER_MESSAGE, message};
        return await this.callSessionWebhook(sessionId, event);
    }
}

export default new WebhookService();
