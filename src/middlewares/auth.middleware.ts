import {NextFunction, Request, Response} from "express";
import SessionService from "../services/session.service";

export default async function checkAuthKey(req: Request, res: Response, next: NextFunction){
    const key = req.headers.authorization;
    if (!key) {
        return res.status(403).json({ error: 'É necessário enviar as crendencias no header' });
    }

    const session = await SessionService.getByApiKey(key);
    if(!session)
        return res.status(401).json({});

    req.context = session;
    next();
}
