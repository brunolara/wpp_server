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

WppClient.on('message', WebhookController.notifyMessage);

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
const worker = new Worker(queue.queueName, MainController.workController, {
    connection: queue.connection
});

worker.on('completed', job => {
    console.log(`${job.name} finished`);
});
