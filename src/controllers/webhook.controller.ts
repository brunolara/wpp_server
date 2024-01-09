import {Job} from "bullmq";
import {WebhookType} from "../DTO/Webhook";
import WebhookService from "../services/webhook.service";
import {Message, MessageAck} from "whatsapp-web.js";

class WebhookController{
    async webhookWorkController(job: Job){
        const data = job.data;
        if(data.type === WebhookType.MESSAGE_ACK){
            await WebhookService.sendMessageStatusNotification(data.message);
        }
        if(data.type === WebhookType.NUMBER_CHECK){
            await WebhookService.sendValidateNumber(data.number, data.messageId, data.status);
        }
    }

    async addMessageStatusToQueue(msg: Message){
        if(msg.ack === MessageAck.ACK_PENDING) return;
        await WebhookService.addMessageStatusToQueue(msg);
    }

}

export default new WebhookController();
