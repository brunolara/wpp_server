import {Queue} from 'bullmq';
import {queue} from '../config/config.json';

const MainQueue = new Queue(queue.messageQueueName, {
    connection: queue.connection,
    defaultJobOptions: queue.messageJobOptions
});

const WebhookQueue = new Queue(queue.webhookQueueName, {
    connection: queue.connection,
    defaultJobOptions: queue.webhookJobOptions
});

export {MainQueue, WebhookQueue};
