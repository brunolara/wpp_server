import { Model, DataTypes } from 'sequelize';
import { sequelize } from './';

class Contact extends Model {
    declare id: number;
    declare rawNumber: string;
    declare verified: boolean;
    declare name: string;
    declare wppId: string;
    declare status: string;
    declare photo: string;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Contact.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        wppId: {
            field: 'wpp_id',
            type: DataTypes.STRING,
            allowNull: true
        },
        rawNumber: {
            field: 'raw_number',
            type: DataTypes.STRING,
            allowNull: true
        },
        verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true
        },
        photo: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: 'contact',
        timestamps: true
    }
);

export { Contact };
