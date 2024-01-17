import { Model, DataTypes } from 'sequelize';
import { sequelize } from './';

class Session extends Model {
    declare id: number;
    declare name: string;
    declare phone_number: string;
    declare qr_code: string;
    declare api_key: string;
    declare wpp_status: number;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Session.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        phone_number:{
            type: DataTypes.STRING,
            allowNull: false
        },
        qr_code: {
            type: DataTypes.STRING,
            allowNull: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        api_key: {
            type: DataTypes.STRING,
            allowNull: false
        },
        wpp_status: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: 'UNLAUNCHED'
        },
    },
    {
        sequelize,
        modelName: 'session',
        timestamps: true
    }
);

export { Session };
