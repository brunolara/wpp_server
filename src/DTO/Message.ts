enum MessageType {
    PLAIN = 'Messageplain',
    BASE64 = 'Messagebase64File',
    REMOTE = 'MessageremoteFile',
    CHECK_NUMBER = 'MessagecheckNumber',
}

interface BaseMessage{
    to: string,
    messageId: string,
    body?: string,
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
