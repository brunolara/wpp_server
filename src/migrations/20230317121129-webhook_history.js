'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('webhook_histories', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            session_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'sessions',
                    key: 'id'
                }
            },
            webhookId: {
                field: 'webhook_id',
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'webhooks',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
            },
            httpResponse: {
                field: 'http_response',
                type: Sequelize.STRING,
                allowNull: false
            },
            messageId: {
                field: 'message_id',
                type: Sequelize.INTEGER,
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('webhook_histories');
    }
};
