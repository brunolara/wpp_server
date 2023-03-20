import {NextFunction, Request, Response} from "express";
import ConfigService, {CONFIGURATION} from "../services/config.service";

export default async function checkAuthKey(req: Request, res: Response, next: NextFunction){
    const authKey = await ConfigService.get(CONFIGURATION.AUTH_KEY);
    if (!req.headers.authorization) {
        return res.status(403).json({ error: 'É necessário enviar as crendencias no header' });
    }
    if(req.headers.authorization !== authKey)
        return res.status(401).json({});
    next();
}
