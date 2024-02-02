import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';
import axios from "axios";
import md5 from "md5";

async function isExists(path: string) {
    try {
        fs.accessSync(path);
        return true;
    } catch {
        return false;
    }
}

async function saveBaseToFile(subPath: string, mimeType: string, data: string){
    try{
        const buff = Buffer.from(data, 'base64');
        const appDir = path.resolve("./");
        const fileName = generateFileName(mimeType);
        const uploadDir = `/uploads/${subPath}/${fileName}`;
        const fullDir = `${appDir}/${uploadDir}`;
        const dirname = path.dirname(fullDir);
        const exist = await isExists(dirname);
        if (!exist) {
            fs.mkdirSync(dirname, {recursive: true});
        }
        fs.writeFileSync(fullDir, buff);
        return uploadDir;
    } catch (e){
        return null;
    }
}

async function downloadProfilePhoto(subPath:string, url:string){
    try{
        const appDir = path.resolve("./");
        const fileName = `${md5(url)}.jpeg`;
        const uploadDir = `/uploads/${subPath}/${fileName}`;
        const fullDir = `${appDir}/${uploadDir}`;
        const dirname = path.dirname(fullDir);
        const exist = await isExists(dirname);
        if (!exist) {
            fs.mkdirSync(dirname, {recursive: true});
        }
        const response = await axios.get(url, {responseType: 'arraybuffer'});
        fs.writeFileSync(fullDir, response.data);
        return uploadDir;
    } catch (e){
        return null;
    }
}

function generateFileName(mimeType: string){
    let name = uuidv4();
    return `${name}.${mime.extension(mimeType)}`;
}

export {saveBaseToFile, generateFileName, downloadProfilePhoto}
