import pkg from 'pg';

const { Pool } = pkg;
const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT,
  pool: {
    max: 5,
    min: 0,
    idle: 300000,
    acquire: 300000
  },
});
export default pool;
