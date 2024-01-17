import { Model, DataTypes } from 'sequelize';
import { sequelize } from './';

class Webhook extends Model {
    declare id: number;
    declare originNumber: string;
    declare url: string;
    declare status: string;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Webhook.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        originNumber: {
            field: 'origin_number',
            type: DataTypes.STRING,
            allowNull: false
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'active'
        }
    },
    {
        sequelize,
        modelName: 'webhook',
        timestamps: true
    }
);

export { Webhook };
