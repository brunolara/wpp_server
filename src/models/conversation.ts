import { Model, DataTypes } from 'sequelize';
import { sequelize } from './';
import {Contact} from "./contact";

class Conversation extends Model {
    declare id: number;
    declare isUserStarted: boolean;
    declare contactId: number;
    declare lastInteractionDate: Date;
    declare currentNumber: string | null;
    declare sessionId: number;
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
        contactId: {
            field: 'contact_id',
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'contacts',
                key: 'id'
            }
        },
        sessionId: {
            type: DataTypes.INTEGER,
            field: 'session_id',
            allowNull: false,
            references: {
                model: 'sessions',
                key: 'id'
            }
        },
        isUserStarted: {
            field: 'is_user_started',
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
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

Conversation.belongsTo(Contact, {foreignKey: 'contact_id'})

export { Conversation };
