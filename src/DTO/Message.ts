enum MessageType {
    PLAIN = 'plain',
    BASE64 = 'base64File',
    REMOTE = 'remoteFile',
}

interface BaseMessage{
    to: string,
    messageId: string
}
interface PlainMessage extends BaseMessage{
    body: string,
}

interface Base64Message extends BaseMessage{
    base64File: string,
    mimeType: string,
    fileName: string,
}

interface RemoteFileMessage extends BaseMessage{
    fileUrl: string,
    fileName: string,
}

export {PlainMessage, MessageType, Base64Message, RemoteFileMessage}
