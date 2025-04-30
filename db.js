import pkg from 'pg';
import config from 'dotenv/config';

const { Pool } = pkg;
const pool = new Pool({
  user: process.env.user,
  host: process.env.host,
  database: process.env.database,
  password: process.env.password,
  port: process.env.port,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 5000, // Tempo limite de conexão de 5 segundos
  idleTimeoutMillis: 30000, // Fecha conexões inativas após 30 segundos
});

export default pool;
