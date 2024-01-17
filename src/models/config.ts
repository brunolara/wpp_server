import { Model, DataTypes } from 'sequelize';
import { sequelize } from './';

class Config extends Model {
    declare id: number;
    declare key: string;
    declare value: string;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Config.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: 'config',
        timestamps: true
    }
);

export { Config };
