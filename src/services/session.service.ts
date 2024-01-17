import {Session} from "../models/session";

class SessionService{
    async getByApiKey(apiKey: string){
        return Session.findOne({
            where: {
                api_key: apiKey
            }
        });
    }

    async getAll(){
        return Session.findAll();
    }
}

export default new SessionService();
