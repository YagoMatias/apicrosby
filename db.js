import pkg from 'pg';

const { Pool } = pkg;
const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT,
  ssl:{
    rejectUnauthorized:false
  },connectionTimeoutMillis:5000,
  idleTimeoutMillis:30000,
});
export default pool;
