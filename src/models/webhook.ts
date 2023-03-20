import { Model, DataTypes } from 'sequelize';
import { sequelize } from './';

class Webhook extends Model {
    public id!: number;
    public originNumber!: string;
    public url!: string;
    public status!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
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
