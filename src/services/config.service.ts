import {Config} from "../models/config";

export enum CONFIGURATION{
    CURRENT_PHONE_NUMBER = 'current_number',
    AUTH_KEY = 'secret_key'
}

class ConfigService{
    async get(key: CONFIGURATION){
        return (await Config.findOne({
            where: {key}
        }))?.value;
    }

    async set(key: string, value: string){
        const config = await Config.findOne({
            where: {key}
        });
        if(!config) {
            await Config.create({
                key,
                value
            })
        }
        else {
            config.value = value;
            await config.save();
        }
    }
}

export default new ConfigService();

