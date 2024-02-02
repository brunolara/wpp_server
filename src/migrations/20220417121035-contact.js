'use strict';
const {DataTypes} = require("sequelize");
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('contacts', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            wppId: {
                field: 'wpp_id',
                type: Sequelize.STRING,
                allowNull: true
            },
            verified: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: true
            },
            rawNumber: {
                field: 'raw_number',
                type: Sequelize.STRING,
                allowNull: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: true
            },
            status: {
                type: Sequelize.STRING,
                allowNull: true
            },
            photo: {
                type: Sequelize.STRING,
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('contacts');
    }
};
