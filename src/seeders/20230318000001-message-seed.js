'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const date = new Date();
        const message = [
            {
                conversation_id: 1,
                message: 'Olá, como posso ajudar?',
                message_file_path: null,
                is_user: false,
                createdAt: date,
                updatedAt: date,
            },
            {
                conversation_id: 2,
                message: 'Qual é o seu nome?',
                message_file_path: null,
                is_user: true,
                createdAt: date,
                updatedAt: date,
            },
            {
                conversation_id: 2,
                message: 'Meu nome é João',
                message_file_path: null,
                is_user: false,
                createdAt: date,
                updatedAt: date,
            },
            {
                conversation_id: 1,
                message: 'Estou com um problema no meu celular',
                message_file_path: null,
                is_user: true,
                createdAt: date,
                updatedAt: date,
            }
        ];
        await queryInterface.bulkInsert('messages', message);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('messages', null, {});
    }
};
