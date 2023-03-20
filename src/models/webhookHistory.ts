import { Model, DataTypes } from 'sequelize';
import { sequelize } from './';
import { Webhook } from './webhook';
import { Message } from './message';

class WebhookHistory extends Model {
    public id!: number;
    public webhookId!: number;
    public httpResponse!: string;
    public messageId!: number | null;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
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
