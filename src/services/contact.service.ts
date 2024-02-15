import {WppService} from "./wpp.service";
import {Contact} from "../models/contact";
import {Contact as WppContact} from 'whatsapp-web.js'
import WebhookService from "./webhook.service";
import {downloadProfilePhoto} from "../helpers/file.helper";
import md5 from "md5";

export class ContactService{
    wppService: WppService;
    constructor(wppService: WppService) {
        this.wppService = wppService;
    }

    async addVerifiedContactToWebhook(contact: Contact, requestId?: number){
        await WebhookService.addNumberCheckToQueue(contact, this.wppService.sessionId, true, requestId);
    }

    async addUnverifiedContactToWebhook(contact: Contact, requestId?: number){
        await WebhookService.addNumberCheckToQueue(contact, this.wppService.sessionId, false, requestId);
    }

    async invalidateContact(number: string){
        const contact = await Contact.findOne({
            where: {rawNumber: number}
        });
        if(!contact) return;
        contact.verified = false;
        return await contact.save();
    }

    async shouldUpdatePhoto(contactId: number, photoUrl: string){
        const contact = await Contact.findByPk(contactId);
        if(!contact) return false;
        if(!photoUrl) return false;
        return contact.photo !== `${md5(photoUrl)}.jpeg`;

    }

    async checkNumber(number: string, requestId?: number){
        try{
            const wppContact = await this.wppService.getContactFromNumber(number);
            const contact = await this.saveContact(number);
            if(contact.verified) {
                console.warn("FROM CACHE")
                await this.addVerifiedContactToWebhook(contact, requestId);
                return true;
            }
            if(!wppContact) {
                await this.invalidateContact(number);
                await this.addUnverifiedContactToWebhook(contact, requestId);
                return false;
            }
            await this.updateContact(number, wppContact, requestId);
            return true;
        } catch (e){
            console.log(e)
        }
    }

    async updateContact(userNumber: string, wppContact: WppContact, requestId?: number){
        try{
            let contact = await Contact.findOne({
                where: {rawNumber: userNumber}
            });
            const {pushname, name, number, shortName} = wppContact;
            const status = await wppContact.getAbout();
            const photoUrl = await wppContact.getProfilePicUrl();
            if(!contact) {
                const photo = await downloadProfilePhoto(`${userNumber}/profile`, photoUrl);
                contact = await Contact.create({
                    wppId: wppContact.id._serialized,
                    name: pushname ?? name ?? '',
                    status,
                    photo,
                    rawNumber: number?.indexOf('@') !== -1 ? number : number?.split('@')[0],
                    verified: true,
                });
            }else{
                contact.wppId = wppContact.id._serialized;
                contact.name = name ?? shortName ?? '';
                contact.status = status ?? '';
                if(await this.shouldUpdatePhoto(contact.id, photoUrl))
                    contact.photo = await downloadProfilePhoto(`${userNumber}/profile`, photoUrl) ?? '';
                contact.verified = true;
                contact = await contact.save();
            }
            await this.addVerifiedContactToWebhook(contact, requestId);
            return contact;
        } catch (e){
             console.warn(e);
            throw e;
        }
    }

    async saveContact(number: string){
        const contactExists = await Contact.findOne({
            where: {rawNumber: number}
        });

        if(contactExists) {
            return contactExists;
        }

        return await Contact.create({
            rawNumber: number,
            verified: false,
        });
    }
}