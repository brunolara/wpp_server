import express, {Router} from 'express'
import {WppClient} from "./wpp";
import WebhookController from "./controllers/webhook.controller";
import MainController from "./controllers/main.controller";
import checkAuthKey from "./middlewares/auth.middleware";

const app = express();

const route = Router()

app.use(express.json())
app.use('/files', express.static('uploads'));

WppClient.initialize();
WppClient.on('message_ack', WebhookController.addMessageStatusToQueue);

route.use(checkAuthKey);

route.post('/sendMessage', MainController.sendPlain);
route.post('/sendMessageBulk', MainController.sendBulk);
route.post('/sendFile', MainController.sendFile);
route.get('/getMessage/:messageId', MainController.getMessage);
route.get('/ping', MainController.ping);

app.use(route);

app.listen(3333, () => console.log('server running on port 3333'));

