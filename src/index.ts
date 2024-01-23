import express, {Router} from 'express'
import checkAuthKey from "./middlewares/auth.middleware";
import {Session} from "./models/session";
import {Config} from "./models/config";
import wppStateService from "./services/wpp.state.service";
import MainController from "./controllers/main.controller";
import {startWorkers} from "./queue/worker";
import {api} from './config/config.json'

wppStateService.startAll().then((clients) => {
    startWorkers();
}).catch((err) => console.log('error', err));

declare global {
    namespace Express {
        interface Request {
            context: Session
        }
    }
}


const app = express();

const route = Router()

app.use(express.json())
app.use('/files', express.static('uploads'));


route.get('/teste', (req, res) => {
    Config.findAll({
        include:['session']
    }).then((configs) => {
        res.json(configs);
    });
    // res.json({message: 'ok'})
});
route.use(checkAuthKey);

route.post('/sendMessage', MainController.sendMessage);
route.post('/sendMessageBulk', MainController.sendBulk);
route.post('/sendFile', MainController.sendMessage);
route.get('/getMessage/:messageId', MainController.getMessage);
// route.get('/ping');

app.use(route);

app.listen(api.port, () => console.log('server running on port ' + api.port));

