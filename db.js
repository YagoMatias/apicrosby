import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Conectando ao banco de dados PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
pool.connect((err)=>{
  if(err){
    console.error('Erro na Conexão', err.stack)
  }else {console.log("connected")}
})

export default pool;
