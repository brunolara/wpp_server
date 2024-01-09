import {Worker} from "bullmq";
import MainController from "../controllers/main.controller";
import WebhookController from "../controllers/webhook.controller";
import {queue} from '../config/config.json';
const messageWorker = new Worker(queue.messageQueueName, MainController.messageWorkController, {
    connection: queue.connection,
    autorun: false
});

const webhookWorker = new Worker(queue.webhookQueueName, WebhookController.webhookWorkController, {
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
