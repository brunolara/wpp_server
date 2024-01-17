'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('conversations', {
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
            isUserStarted: {
                field: 'is_user_started',
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            userNumber: {
                field: 'user_number',
                type: Sequelize.STRING,
                allowNull: false
            },
            lastInteractionDate: {
                field: 'last_interaction_date',
                type: Sequelize.DATE,
                allowNull: false
            },
            currentNumber: {
                field: 'current_number',
                type: Sequelize.STRING,
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
        }, {
            // underscored: true,
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('conversations');
    }
};
