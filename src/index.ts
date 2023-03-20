import express from 'express'
import {WppClient} from "./wpp";
import WebhookController from "./controllers/webhook.controller";

import { Router, Request, Response } from 'express';
import MainController from "./controllers/main.controller";
import checkAuthKey from "./middlewares/auth.middleware";

const app = express();

const route = Router()

app.use(express.json())

// WppClient.on('message', WebhookController.notifyMessage);

route.post('/sendMessage', checkAuthKey, MainController.sendPlain);
route.post('/sendFile', checkAuthKey, MainController.sendFile);

app.use('/files', express.static('uploads'));

app.use(route);

app.listen(3333, () => console.log('server running on port 3333'));
