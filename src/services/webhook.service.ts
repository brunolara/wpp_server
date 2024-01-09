import {Message} from "../models/message";
import {Message as WppMessage} from "whatsapp-web.js";
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
    async sendMessageStatusNotification(message: WppMessage){
        const currentMessage = await this.getMessageByWppId(message.id._serialized);
        /* direct messages only */
        if(!currentMessage) throw new Error('Message not found');

        currentMessage.wppMessageStatus = message.ack;
        await currentMessage.save();

        const webhookList = await Webhook.findAll({
            where: {'status': 'active'}
        });
        const event = {type: 'message_ack', ack: message.ack, messageId: currentMessage.messageId};
        const reqs = webhookList.map(item => axios.post(item.url, event, {timeout: 3000}));
        await axios.all(reqs);
    }

    async addNumberCheckToQueue(number: string, messageId?: string, status?: boolean){
        await WebhookQueue.add(`number_check_${number}_${new Date().getTime()}`,
            {number, type: WebhookType.NUMBER_CHECK, status, messageId},
            queue.webhookJobOptions
        );
    }

    async addMessageStatusToQueue(msg: WppMessage){
        await WebhookQueue.add(`ack_${msg.id._serialized}_${msg.ack}`,
            {message:msg, type: WebhookType.MESSAGE_ACK},
            queue.webhookJobOptions
        );
    }

    async sendValidateNumber(number: string, messageId?: string, valid?: boolean){
        const webhookList = await Webhook.findAll({
            where: {'status': 'active'}
        });
        const event = {type: WebhookType.NUMBER_CHECK, number, valid, messageId};
        const reqs = webhookList.map(item => axios.post(item.url, event, {timeout: 3000}));
        await axios.all(reqs);
    }
}

export default new WebhookService();
