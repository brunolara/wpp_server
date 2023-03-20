import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from 'uuid';


async function isExists(path: string) {
    try {
        fs.accessSync(path);
        return true;
    } catch {
        return false;
    }
}


async function saveBaseToFile(fileName: string, mimeType: string, data: string){
    try{
        const buff = Buffer.from(data, 'base64');
        const appDir = path.resolve("./");
        const uploadDir = `/uploads/${fileName}`;
        const fullDir = `${appDir}/${uploadDir}`;
        const dirname = path.dirname(fullDir);
        const exist = await isExists(dirname);
        if (!exist) {
            fs.mkdirSync(dirname, {recursive: true});
        }
        fs.writeFileSync(fullDir, buff);
        return uploadDir;
    } catch (e){
        console.log(e)
        console.log(`${path.resolve(__dirname)}/uploads/${fileName}`)
        return null;
    }
}

function generateFileName(fileName: string){
    var ext = path.extname(fileName);
    let name = uuidv4();
    if(ext != '') name += `${ext}`;
    return name;
}

export {saveBaseToFile, generateFileName}
