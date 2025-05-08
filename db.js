import dotenv from 'dotenv';
import { Pool } from 'pg';

// Carregar as variáveis de ambiente do arquivo .env
dotenv.config();

// Criação do pool de conexões com o banco de dados
const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT,
});

// Exportando o pool para uso em outros módulos
export default pool;
