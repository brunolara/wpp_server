'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('webhook_history', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
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
            eventData: {
                field: 'event_data',
                type: Sequelize.JSONB,
                allowNull: true
            },
            messageId: {
                field: 'message_id',
                type: Sequelize.INTEGER,
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('webhook_history');
    }
};
