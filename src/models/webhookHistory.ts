import { Model, DataTypes } from 'sequelize';
import { sequelize } from './';
import { Webhook } from './webhook';
import { Message } from './message';

class WebhookHistory extends Model {
    declare id: number;
    declare webhookId: number;
    declare httpResponse: string;
    declare messageId: number | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

WebhookHistory.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        webhookId: {
            field: 'webhook_id',
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Webhook,
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
        },
        httpResponse: {
            field: 'http_response',
            type: DataTypes.STRING,
            allowNull: false
        },
        messageId: {
            field: 'message_id',
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: 'webhookHistory',
        timestamps: true
    }
);

export { WebhookHistory };
