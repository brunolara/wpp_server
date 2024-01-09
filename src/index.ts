import express, {Request, Response, Router} from 'express'
import {WppClient} from "./wpp";
import WebhookController from "./controllers/webhook.controller";
import MainController from "./controllers/main.controller";
import checkAuthKey from "./middlewares/auth.middleware";
import {WAState} from "whatsapp-web.js";
import {Worker} from "bullmq";
import {queue} from './config/config.json';

const app = express();

const route = Router()

app.use(express.json())

// WppClient.on('message', WebhookController.notifyMessage);
WppClient.on('message_ack', WebhookController.addMessageStatusToQueue);
WppClient.on('ready', () => messageWorker.run());
WppClient.on('disconnected', () => messageWorker.pause());
WppClient.on('auth_failure', () => messageWorker.pause())

route.post('/sendMessage', checkAuthKey, MainController.sendPlain);
route.post('/sendFile', checkAuthKey, MainController.sendFile);

route.get('/ping', async (req: Request, res: Response) => {
    const currentState = await WppClient.getState()
    if(currentState !== WAState.CONNECTED) return res.status(400).json({status: currentState});
    else return res.json({status: "Tudo ok!"});
});

app.use('/files', express.static('uploads'));

app.use(route);

app.listen(3333, () => console.log('server running on port 3333'));

/* starting worker */
const messageWorker = new Worker(queue.messageQueueName, MainController.messageWorkController, {
    connection: queue.connection,
    autorun: false
});

const webhookWorker = new Worker(queue.webhookQueueName, WebhookController.webhookWorkController, {
    connection: queue.connection,
    autorun: true
});

messageWorker.on('completed', job => {
    console.log(`${job.name} finished`);
});
webhookWorker.on('completed', job => {
    console.log(`${job.name} finished`);
})
