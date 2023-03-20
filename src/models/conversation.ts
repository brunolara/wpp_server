import { Model, DataTypes } from 'sequelize';
import { sequelize } from './';
import {Message} from "./message";

class Conversation extends Model {
    public id!: number;
    public isUserStarted!: boolean;
    public userNumber!: string;
    public lastInteractionDate!: Date;
    public currentNumber!: string | null;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Conversation.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        isUserStarted: {
            field: 'is_user_started',
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        userNumber: {
            field: 'user_number',
            type: DataTypes.STRING,
            allowNull: false
        },
        lastInteractionDate: {
            field: 'last_interaction_date',
            type: DataTypes.DATE,
            allowNull: false
        },
        currentNumber: {
            field: 'current_number',
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: 'conversation',
        timestamps: true
    }
);

export { Conversation };
