import {Client, LocalAuth, MessageMedia, WAState} from "whatsapp-web.js";

import qrcode from "qrcode-terminal";
import ConfigService, {CONFIGURATION} from "../services/config.service";
import path from "path";
import {startWorkers, stopWorkers} from "../queue/worker";


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
        return await new MessageMedia(mimeType, data, fileName)
    } catch (e){
        return null;
    }
}

async function sendMessage(to: string, body: string | MessageMedia, caption: string | null = null){
    // try {
    //     if(await WppClient.getState() !== WAState.CONNECTED) return null;
    //     const contactId = await WppClient.getNumberId(to);
    //     if(contactId == null) {
    //         return null;
    //     }
    //     return await WppClient.sendMessage(
    //         `${contactId.user}@${contactId.server}`,
    //         body, {caption: caption ?? ''}
    //     );
    // } catch (e){
    //     return null;
    // }
}

async function getContactFromNumber(number:string){
    // try {
    //     if(await WppClient.getState() !== WAState.CONNECTED) return null;
    //     const contactId = await WppClient.getNumberId(number);
    //     if(!contactId) return null;
    //     return contactId;
    // } catch (e){
    //     return null;
    // }
}

export {sendMessage, getMedia, getMediaFromBase64, getContactFromNumber};
