'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const date = new Date();
        const conversation = [
            {
                is_user_started: true,
                user_number: '+5511987654321',
                last_interaction_date: date,
                current_number: null,
                createdAt: date,
                updatedAt: date,
            },
            {
                is_user_started: false,
                user_number: '+5511123456789',
                last_interaction_date: date,
                current_number: '+5511987654321',
                createdAt: date,
                updatedAt: date,
            }
        ];
        await queryInterface.bulkInsert('conversations', conversation);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('conversations', null, {});
    }
};
