import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Conectando ao banco de dados PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


export default pool;
