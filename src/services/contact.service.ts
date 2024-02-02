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

    async addVerifiedContactToWebhook(contact: Contact){
        await WebhookService.addNumberCheckToQueue(contact, this.wppService.sessionId);
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
        return contact.photo !== `${md5(photoUrl)}.jpeg`;

    }

    async updateContact(userNumber: string, wppContact: WppContact){
        const contact = await Contact.findOne({
            where: {rawNumber: userNumber}
        });
        const {name, number, shortName} = wppContact;
        const status = await wppContact.getAbout();
        const photoUrl = await wppContact.getProfilePicUrl();
        if(!contact) {
            const photo = await downloadProfilePhoto(`${userNumber}/profile`, photoUrl);
            return await Contact.create({
                wppId: wppContact.id._serialized,
                name: name ?? shortName ?? '',
                status,
                photo,
                rawNumber: number?.indexOf('@') !== -1 ? number : number?.split('@')[0],
                verified: true,
            });
        }
        contact.wppId = wppContact.id._serialized;
        contact.name = name ?? shortName ?? '';
        contact.status = status ?? '';
        if(await this.shouldUpdatePhoto(contact.id, photoUrl))
            contact.photo = await downloadProfilePhoto(`${userNumber}/profile`, photoUrl) ?? '';
        contact.verified = true;
        const newContact = await contact.save();
        await this.addVerifiedContactToWebhook(newContact);
        return newContact;
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