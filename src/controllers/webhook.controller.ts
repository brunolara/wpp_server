import {Message, MessageTypes} from "whatsapp-web.js";
import {Webhook} from "../models/webhook";
import axios from "axios";

class WebhookController{
    async notifyMessage(msg: Message){
        let chat = await msg.getChat();
        /* direct messages only */
        if(chat.isGroup || msg.type !== MessageTypes.TEXT) return;
        const webhookList = await Webhook.findAll({
            where: {'status': 'active'}
        });
        const reqs = webhookList.map(item => axios.post(item.url, msg, {timeout: 3000}));
        await axios.all(reqs);
    }
}

export default new WebhookController();
