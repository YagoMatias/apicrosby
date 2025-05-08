import dotenv from 'dotenv';
import { Pool } from 'pg';

// Carregar as variáveis de ambiente do arquivo .env
dotenv.config();

// Criação do pool de conexões com o banco de dados
const pool = new Pool({
  user: process.env.user,
  host: process.env.host,
  database: process.env.database,
  password: process.env.password,
  port: process.env.port,
});

// Exportando o pool para uso em outros módulos
export default pool;
