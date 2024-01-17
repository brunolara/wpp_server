import { Sequelize } from 'sequelize';
import config from '../config/config.json';

const env= process.env.NODE_ENV || 'development';

// Cria uma nova instância do Sequelize com as configurações de conexão
const sequelize = new Sequelize({
    database: config[env as keyof object]['database'],
    username: config[env as keyof object]['username'],
    password: config[env as keyof object]['password'],
    host: config[env as keyof object]['host'],
    port: Number(process.env.DB_PORT),
    dialect: config[env as keyof object]['dialect'],
    timezone: config[env as keyof object]['timezone'],
    logging: false // Para desativar o log de consultas no console
});

// Testa a conexão com o banco de dados
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexão com o banco de dados estabelecida com sucesso!');
    } catch (error) {
        console.error('Erro ao conectar com o banco de dados:', error);
    }
})();

export { sequelize };
