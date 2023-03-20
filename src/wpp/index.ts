import {Client, LocalAuth, MessageMedia, WAState, Message, ContactId, Chat} from "whatsapp-web.js";

import qrcode from "qrcode-terminal";
import ConfigService, {CONFIGURATION} from "../services/config.service";

const WppClient = new Client({
    authStrategy: new LocalAuth()
});

WppClient.on('qr', (qr) => {
    console.log("QR")
    // NOTE: This event will not be fired if a session is specified.
    qrcode.generate(qr, {small: true});
});

WppClient.on('ready', () =>{
    console.log('READY');
    ConfigService.set(CONFIGURATION.CURRENT_PHONE_NUMBER, WppClient.info.wid.user);
});

WppClient.on('auth_failure', (msg) => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});



WppClient.initialize();

async function getMedia(url:string, fileName: string):Promise<MessageMedia | null>{
    try {
        return await MessageMedia.fromUrl(url,{
            unsafeMime: true,
            filename: fileName,
        });
    } catch (e){
        return null;
    }
}

async function getMediaFromBase64(data: string, fileName: string, mimeType: string):Promise<MessageMedia | null>{
    try {
        console.log(data, fileName, mimeType)
        return await new MessageMedia(mimeType, data, fileName)
    } catch (e){
        return null;
    }
}

async function sendMessage(to: string, body: string | MessageMedia, caption: string | null = null){
    try {
        if(await WppClient.getState() !== WAState.CONNECTED) return null;
        const contactId = await WppClient.getNumberId(to);
        if(contactId == null) {
            return null;
        }
        return await WppClient.sendMessage(
            `${contactId.user}@${contactId.server}`,
            body, {caption: caption ?? ''}
        );
    } catch (e){
        console.log(e)
        return null;
    }
}

async function getContactFromNumber(number:string){
    try {
        if(await WppClient.getState() !== WAState.CONNECTED) return null;
        const contactId = await WppClient.getNumberId(number);
        if(!contactId) return null;
        return contactId;
    } catch (e){
        return null;
    }
}

export {WppClient, sendMessage, getMedia, getMediaFromBase64, getContactFromNumber};
