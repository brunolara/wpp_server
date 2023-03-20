import { Model, DataTypes } from 'sequelize';
import { sequelize } from './';
import { Conversation } from './conversation';

class Message extends Model {
    public id!: number;
    public conversationId!: number;
    public message!: string | null;
    public messageFilePath!: string | null;
    public isUser!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Message.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        conversationId: {
            field: 'conversation_id',
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Conversation,
                key: 'id'
            },
            onUpdate: 'cascade',
            onDelete: 'cascade'
        },
        message: {
            type: DataTypes.STRING,
            allowNull: true
        },
        messageFilePath: {
            field: 'message_file_path',
            type: DataTypes.STRING,
            allowNull: true
        },
        isUser: {
            field: 'is_user',
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
    },
    {
        sequelize,
        modelName: 'message',
        timestamps: true
    }
);

Conversation.hasMany(Message, {
    foreignKey: 'conversationId',
    as: 'messages'
});

Message.belongsTo(Conversation, {
    foreignKey: 'conversationId',
    as: 'conversation'
});



export { Message };
