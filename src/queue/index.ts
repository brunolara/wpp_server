import {Queue} from 'bullmq';
import {queue} from '../config/config.json';

const MainQueue = new Queue(queue.queueName, {
    connection: queue.connection
});

export {MainQueue};
