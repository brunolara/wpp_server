import { Model, DataTypes } from 'sequelize';
import { sequelize } from './';
import {Session} from "./session";

class Config extends Model {
    declare id: number;
    declare key: string;
    declare value: string;
    declare session_id: string;
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
        session_id: {
            type: DataTypes.INTEGER,
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

Config.belongsTo(Session, {foreignKey: 'session_id'})

export { Config };
