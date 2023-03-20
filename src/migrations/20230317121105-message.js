'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('messages', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            conversationId: {
                field: 'conversation_id',
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'conversations',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
            },
            message: {
                type: Sequelize.STRING,
                allowNull: true
            },
            messageFilePath: {
                field: 'message_file_path',
                type: Sequelize.STRING,
                allowNull: true
            },
            isUser: {
                field: 'is_user',
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
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
        await queryInterface.dropTable('messages');
    }
};
