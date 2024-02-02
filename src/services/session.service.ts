import {Session} from "../models/session";

class SessionService{
    async getByApiKey(apiKey: string){
        return Session.findOne({
            where: {
                api_key: apiKey
            }
        });
    }

    async getQrCode(apiKey: string){
        const session = await this.getByApiKey(apiKey);
        if(!session) return null;
        return session.qr_code;
    }

    async getAll(){
        return Session.findAll();
    }
}

export default new SessionService();
