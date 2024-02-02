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

interface MessageSaveDTO{
    to?: string,
    from?: string,
    body: string,
    filePath?: string | null,
    messageId: string,
    wppMessageId?: string,
    isUser: boolean
}

export {PlainMessage, MessageType, Base64Message, RemoteFileMessage, MessageSaveDTO}
