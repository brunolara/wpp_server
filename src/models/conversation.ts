import { Model, DataTypes } from 'sequelize';
import { sequelize } from './';
import {Message} from "./message";

class Conversation extends Model {
    declare id: number;
    declare isUserStarted: boolean;
    declare userNumber: string;
    declare lastInteractionDate: Date;
    declare currentNumber: string | null;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
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
