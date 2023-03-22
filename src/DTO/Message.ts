enum MessageType {
    PLAIN = 'plain',
    BASE64 = 'base64File',
    REMOTE = 'remoteFile',
}
interface PlainMessage{
    to: string,
    body: string,
    type: MessageType
}

interface Base64Message{
    to: string,
    base64File: string,
    mimeType: string,
    fileName: string,
    type: MessageType
}

interface RemoteFileMessage{
    to: string,
    fileUrl: string,
    fileName: string,
    type: MessageType
}

export {PlainMessage, MessageType, Base64Message, RemoteFileMessage}
