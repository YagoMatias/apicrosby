import express from 'express';
import pool from './db.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Middlewares essenciais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração segura de CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
});

// Handler global de erros
process.on('unhandledRejection', (err) => {
  console.error('Erro não tratado:', err);
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Rota principal com tratamento melhorado
app.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM TRA_TRANSACAO WHERE CD_GRUPOEMPRESA = 97 LIMIT 10',
      );
      res.json(result.rows);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Erro de banco:', err);
    res.status(503).json({ error: 'Service Unavailable' });
  }
});

// Configuração segura do servidor
const server = app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${server.address().port}`);
});

// Handlers para eventos de servidor
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Porta ${process.env.PORT} já em uso`);
    process.exit(1);
  } else {
    console.error('Erro no servidor:', error);
  }
});

server.on('connection', (socket) => {
  socket.setTimeout(30000); // 30s timeout
  console.log(`Nova conexão: ${socket.remoteAddress}`);
});

// Gerenciamento de shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    pool.end();
    console.log('Servidor encerrado graciosamente');
    process.exit(0);
  });
});
