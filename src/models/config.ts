import { Model, DataTypes } from 'sequelize';
import { sequelize } from './';

class Config extends Model {
    public id!: number;
    public key!: string;
    public value!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
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
