import express, {Router} from 'express'
import checkAuthKey from "./middlewares/auth.middleware";
import {Session} from "./models/session";
import wppStateService from "./services/wpp.state.service";
import MainController from "./controllers/main.controller";
import {startWorkers} from "./queue/worker";
import {api} from './config/config.json'

wppStateService.startAll().then(() => {
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
app.set('view engine', 'ejs');
app.use('/uploads', express.static('uploads'));


route.post('/sendMessage', checkAuthKey, MainController.sendMessage);
route.post('/sendMessageBulk', checkAuthKey, MainController.sendBulk);
route.get('/getMessage/:messageId', checkAuthKey, MainController.getMessage);
route.get('/state', checkAuthKey, MainController.getState);
route.get('/start', checkAuthKey, MainController.start);
route.get('/qr', MainController.qr);


// route.get('/ping');

app.use(route);

app.listen(api.port, () => console.log('server running on port ' + api.port));

