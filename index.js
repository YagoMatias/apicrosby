import express from 'express';
import pool from './db.js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rank;
// app.get('/', async (req, res) => {
//   const inicio = req.query.inicio;
//   const fim = req.query.fim;

//   const dataInicio = `${inicio} 00:00:00`;
//   const dataFim = `${fim} 23:59:59`;
//   try {
//     const resultado = await pool.query(
//       `SELECT
//           CD_GRUPOEMPRESA,
//                     SUM(
//           CASE
//             WHEN TP_OPERACAO = 'E' AND TP_SITUACAO = 4 THEN QT_SOLICITADA
//             ELSE 0
//            END
//           ) AS PAENTRADA,
//           SUM(
//           CASE
//             WHEN TP_OPERACAO = 'S' AND TP_SITUACAO = 4 THEN QT_SOLICITADA
//             ELSE 0
//            END
//           ) AS PASAIDA,
//           COUNT(*) FILTER(WHERE TP_SITUACAO = 4 AND TP_OPERACAO = 'S') AS TRASAIDA,
//           COUNT(*) FILTER(WHERE TP_SITUACAO = 4 AND TP_OPERACAO = 'E') AS TRAENTRADA,
//           SUM(
//              CASE
//                WHEN TP_SITUACAO = 4 AND TP_OPERACAO = 'S' THEN VL_TOTAL
//                WHEN TP_SITUACAO = 4 AND TP_OPERACAO = 'E' THEN -VL_TOTAL
//                ELSE 0
//              END) AS FATURAMENTO
//          FROM TRA_TRANSACAO
//          WHERE
//            TP_SITUACAO = 4 AND
//            TP_OPERACAO IN ('S', 'E') AND
//            CD_OPERACAO IN (1,2,510,511,1511,521,1521,522,960,9001,9009,9027,8750,9017,9400,9401,9402,9403,9005,545,546,555,548,1210) AND
//            CD_GRUPOEMPRESA BETWEEN $1 AND $2 AND
//            DT_TRANSACAO BETWEEN $3::timestamp AND $4::timestamp
//          GROUP BY CD_GRUPOEMPRESA
//          ORDER BY FATURAMENTO DESC`,
//       [1, 7000, [dataInicio], [dataFim]],
//     );
//     // const resultado2 = await pool.query(
//     //   `SELECT * FROM TRA_TRANSACAO WHERE CD_GRUPOEMPRESA = 6046`,
//     // );

//     res.json(resultado.rows);
//     console.log(resultado.rows);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Erro no servidor');
//   }
// });
//Home
// app.get('/home', async (req, res) => {
//   const inicio = req.query.inicio;
//   const fim = req.query.fim;

//   const dataInicio = `${inicio} 00:00:00`;
//   const dataFim = `${fim} 23:59:59`;
//   try {
//     const resultado = await pool.query(
//       `SELECT
//           SUM(
//           CASE
//             WHEN TP_OPERACAO = 'E' AND TP_SITUACAO = 4 THEN QT_SOLICITADA
//             ELSE 0
//            END
//           ) AS PAENTRADA,
//           SUM(
//           CASE
//             WHEN TP_OPERACAO = 'S' AND TP_SITUACAO = 4 THEN QT_SOLICITADA
//             ELSE 0
//            END
//           ) AS PASAIDA,
//           COUNT(*) FILTER(WHERE TP_SITUACAO = 4 AND TP_OPERACAO = 'S') AS TRASAIDA,
//           COUNT(*) FILTER(WHERE TP_SITUACAO = 4 AND TP_OPERACAO = 'E') AS TRAENTRADA,
//           SUM(
//              CASE
//                WHEN TP_SITUACAO = 4 AND TP_OPERACAO = 'S' THEN VL_TOTAL
//                WHEN TP_SITUACAO = 4 AND TP_OPERACAO = 'E' THEN -VL_TOTAL
//                ELSE 0
//              END) AS FATURAMENTO
//          FROM TRA_TRANSACAO
//          WHERE
//            TP_SITUACAO = 4 AND
//            TP_OPERACAO IN ('S', 'E') AND
//            CD_OPERACAO IN (1,2,510,511,1511,521,1521,522,960,9001,9009,9027,8750,9017,9400,9401,9402,9403,9005,545,546,555,548,1210) AND
//            DT_TRANSACAO BETWEEN $1::timestamp AND $2::timestamp
//          ORDER BY FATURAMENTO DESC`,
//       [[dataInicio], [dataFim]],
//     );

//     res.json(resultado.rows);
//     console.log(resultado.rows);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Erro no servidor');
//   }
// });

//test
app.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT * FROM TRA_TRANSACAO WHERE CD_EMPRESA = 97',
    );
    console.log('olá mundo');
    res.json(resultado.rows);
    console.log(resultado.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

const PORT = process.env.port || 5432;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
