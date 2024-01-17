import {Message} from "../models/message";
import {Message as WppMessage, MessageAck} from "whatsapp-web.js";
import {Webhook} from "../models/webhook";
import axios from "axios";
import {WebhookType} from "../DTO/Webhook";
import {WebhookQueue} from "../queue/main";
import {queue} from '../config/config.json';
class WebhookService{
    async getMessageByWppId(wppMessageId: string){
        return await Message.findOne({
            where: {
                wppMessageId
            }
        });
    }

    async callSessionWebhook(sessionId: number, event: any){
        const webhookList = await Webhook.findAll({
            where: {'status': 'active', session_Id: sessionId}
        });

        const reqs = webhookList.map(item => axios.post(item.url, event, {timeout: 3000}));
        await axios.all(reqs);
    }

    addStatusToQueue(status: string, sessionId: number, data: any = {}){
        return WebhookQueue.add(`conn_status_${status}_${sessionId}_${new Date().getTime()}`,
            {status, type: WebhookType.CONN_STATUS, sessionId, data},
            queue.webhookJobOptions
        );
    }
    async sendConStatus(status: string, sessionId :number, data: any = {}){
        const event = {type: 'conn_status', status, data};
        await this.callSessionWebhook(sessionId, event);
    }

    async addSendMessageErrorQueue(messageId: string, sessionId: number, error: any){
        await WebhookQueue.add(`send_message_error_${messageId}_${new Date().getTime()}`,
            {messageId, type: WebhookType.SEND_MESSAGE_ERROR, error, sessionId},
            queue.webhookJobOptions
        );
    }

    async sendSendMessageError(messageId: string, sessionId: number, error: any){
        const event = {type: 'send_message_error', error, messageId};
        await this.callSessionWebhook(sessionId, event)
    }

    async sendMessageStatusNotification(message: WppMessage, sessionId: number, status?: MessageAck){
        const currentMessage = await this.getMessageByWppId(message.id._serialized);
        /* direct messages only */
        if(!currentMessage) throw new Error('Message not found');

        currentMessage.wppMessageStatus = message.ack;
        await currentMessage.save();

        const event = {type: 'message_ack', ack: status ?? message.ack, messageId: currentMessage.messageId};
        await this.callSessionWebhook(sessionId, event)
    }

    async addNumberCheckToQueue(number: string, sessionId: number, messageId?: string, status?: boolean){
        await WebhookQueue.add(`number_check_${number}_${new Date().getTime()}`,
            {number, type: WebhookType.NUMBER_CHECK, status, messageId, sessionId},
            queue.webhookJobOptions
        );
    }

    async addMessageStatusToQueue(msg: WppMessage){
        await WebhookQueue.add(`ack_${msg.id._serialized}_${msg.ack}`,
            {message:msg, type: WebhookType.MESSAGE_ACK},
            queue.webhookJobOptions
        );
    }

    async sendValidateNumber(number: string, sessionId: number, messageId?: string, valid?: boolean){
        const event = {type: WebhookType.NUMBER_CHECK, number, valid, messageId};
        await this.callSessionWebhook(sessionId, event);
    }
}

export default new WebhookService();
