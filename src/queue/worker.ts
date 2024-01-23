import {Job, Worker} from "bullmq";
import {queue} from '../config/config.json';
import {Base64Message, MessageType, PlainMessage, RemoteFileMessage} from "../DTO/Message";
import ConversationService from "../services/conversation.service";
import {WebhookType} from "../DTO/Webhook";
import WebhookService from "../services/webhook.service";
import WppStateService from "../services/wpp.state.service";

const messageWorker = new Worker(queue.messageQueueName, async (job: Job) => {
    console.log(`${job.name} started`);
    const session = WppStateService.getWppSession(job.data.sessionData.id);
    if(!session) throw new Error('Sessao nao encontrada');
    if(session.currentStatus !== 'CONNECTED') {
        throw new Error('Ainda nao conectado');
    }
    const service = new ConversationService(session);
    if(job.data.type === MessageType.PLAIN){
        const data: PlainMessage = job.data;
        await service.handlePlainMessage(data.body.toString(), data.to, data.messageId);
    }

    if(job.data.type === MessageType.BASE64){
        const data: Base64Message = job.data;
        await service.handleBase64FileMessage(data.base64File, data.mimeType, data.fileName, data.to, data.messageId);
    }

    if(job.data.type === MessageType.REMOTE){
        const data: RemoteFileMessage = job.data;
        await service.handleFileUrl(data.fileUrl, data.fileName, data.to, data.messageId);
    }

    return true;
}, {
    connection: queue.connection,
    autorun: false
});

const webhookWorker = new Worker(queue.webhookQueueName, async (job) => {
    const data = job.data;
    if(data.type === WebhookType.MESSAGE_ACK){
        await WebhookService.sendMessageStatusNotification(data.message);
    }
    if(data.type === WebhookType.NUMBER_CHECK){
        await WebhookService.sendValidateNumber(data.number, data.messageId, data.status);
    }
    if(data.type === WebhookType.CONN_STATUS){
        await WebhookService.sendConStatus(data.status, data.sessionId, data.data);
    }
    if(data.type === WebhookType.SEND_MESSAGE_ERROR){
        await WebhookService.sendSendMessageError(data.messageId, data.sessionId, data.error);
    }
}, {
    connection: queue.connection,
    autorun: false
});

const startWorkers = async () => {
    messageWorker.run();
    webhookWorker.run();
}


const stopWorkers = async () => {
    await messageWorker.pause();
    await webhookWorker.pause();
}

messageWorker.on('completed', job => {
    console.log(`${job.name} finished`);
});
webhookWorker.on('completed', job => {
    console.log(`${job.name} finished`);
})

export {messageWorker, webhookWorker, startWorkers, stopWorkers};
