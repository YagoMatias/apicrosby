import express from 'express';
import pool from './db.js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rank;
app.get('/', async (req, res) => {
  
  try {
    
    
    const resultado = await pool.query(
      `SELECT * FROM TRA_TRANSACAO WHERE CD_GRUPOEMPRESA = 97`,
    );

    res.json(resultado.rows);
    console.log(resultado.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

export default app;
