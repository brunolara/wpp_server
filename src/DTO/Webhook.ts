import {MessageAck} from "whatsapp-web.js";

export enum WebhookType{
    MESSAGE_ACK = 'message_ack',
    NUMBER_CHECK = 'number_check'
}

export interface WebhookEvent{
    type: string;
    data: any;
}

export interface MessageAckEvent extends WebhookEvent{
    type: 'message_ack';
    data: {
        ack: MessageAck;
        messageId: string;
    }
}

export interface NumberCheckEvent extends WebhookEvent{
    type: 'number_check';
    data: {
        number: string;
        valid: boolean;
    }
}
