import express from 'express';
import pool from './db.js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

// Rank;
app.get('/', async (req, res) => {
  const inicio = req.query.inicio;
  const fim = req.query.fim;

  const dataInicio = `${inicio} 00:00:00`;
  const dataFim = `${fim} 23:59:59`;
  try {
//     const resultado = await pool.query(
//       `SELECT
//     A.CD_GRUPOEMPRESA,
//     A.CD_PESSOA AS PESSOA_EMPRESA,
//     B.CD_PESSOA AS PESSOA_JURIDICA,
//     B.NM_FANTASIA AS NOME_FANTASIA,
//     SUM(
//       CASE
//         WHEN T.TP_OPERACAO = 'E' AND T.TP_SITUACAO = 4 THEN T.QT_SOLICITADA
//         ELSE 0
//       END
//     ) AS PAENTRADA,
//     SUM(
//       CASE
//         WHEN T.TP_OPERACAO = 'S' AND T.TP_SITUACAO = 4 THEN T.QT_SOLICITADA
//         ELSE 0
//       END
//     ) AS PASAIDA,
//     COUNT(*) FILTER(WHERE T.TP_SITUACAO = 4 AND T.TP_OPERACAO = 'S') AS TRASAIDA,
//     COUNT(*) FILTER(WHERE T.TP_SITUACAO = 4 AND T.TP_OPERACAO = 'E') AS TRAENTRADA,
//     SUM(
//       CASE
//         WHEN T.TP_SITUACAO = 4 AND T.TP_OPERACAO = 'S' THEN T.VL_TOTAL
//         WHEN T.TP_SITUACAO = 4 AND T.TP_OPERACAO = 'E' THEN -T.VL_TOTAL
//         ELSE 0
//       END
//     ) AS FATURAMENTO
// FROM
//     GER_EMPRESA A
// JOIN
//     PES_PESJURIDICA B ON A.CD_PESSOA = B.CD_PESSOA
// LEFT JOIN
//     TRA_TRANSACAO T ON T.CD_GRUPOEMPRESA = A.CD_GRUPOEMPRESA
// WHERE B.CD_PESSOA < 99999 AND B.CD_PESSOA NOT IN(69994,70596) AND
// T.VL_TOTAL > 1 AND
//     (
//         T.TP_SITUACAO IS NULL OR
//         (
//             T.TP_SITUACAO = 4 AND
//             T.TP_OPERACAO IN ('S', 'E') AND
//             T.CD_OPERACAO IN (1,2,510,511,1511,521,1521,522,960,9001,9009,9027,8750,9017,9400,9401,9402,9403,9005,545,546,555,548,1210) AND
//             T.CD_GRUPOEMPRESA BETWEEN $1 AND $2 AND
//             T.DT_TRANSACAO BETWEEN $3::timestamp AND $4::timestamp
//         )
//     )
// GROUP BY
//     A.CD_GRUPOEMPRESA,
//     A.CD_PESSOA,
//     B.CD_PESSOA,
//     B.NM_FANTASIA
// ORDER BY
//     FATURAMENTO DESC,
//     B.NM_FANTASIA;`,
//       [1, 7000, [dataInicio], [dataFim]],
//     );
    const resultado2 = await pool.query(
      `SELECT * FROM TRA_TRANSACAO WHERE CD_GRUPOEMPRESA = 97`,
    );

    res.json(resultado2.rows);
    console.log(resultado2.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});
// // Home;
app.get('/home', async (req, res) => {
  const inicio = req.query.inicio;
  const fim = req.query.fim;

  const dataInicio = `${inicio} 00:00:00`;
  const dataFim = `${fim} 23:59:59`;
  try {
    const resultado = await pool.query(
      `SELECT
          SUM(
          CASE
            WHEN TP_OPERACAO = 'E' AND TP_SITUACAO = 4 THEN QT_SOLICITADA
            ELSE 0
           END
          ) AS PAENTRADA,
          SUM(
          CASE
            WHEN TP_OPERACAO = 'S' AND TP_SITUACAO = 4 THEN QT_SOLICITADA
            ELSE 0
           END
          ) AS PASAIDA,
          COUNT(*) FILTER(WHERE TP_SITUACAO = 4 AND TP_OPERACAO = 'S') AS TRASAIDA,
          COUNT(*) FILTER(WHERE TP_SITUACAO = 4 AND TP_OPERACAO = 'E') AS TRAENTRADA,
          SUM(
             CASE
               WHEN TP_SITUACAO = 4 AND TP_OPERACAO = 'S' THEN VL_TOTAL
               WHEN TP_SITUACAO = 4 AND TP_OPERACAO = 'E' THEN -VL_TOTAL
               ELSE 0
             END) AS FATURAMENTO
         FROM TRA_TRANSACAO
         WHERE
           TP_SITUACAO = 4 AND
           TP_OPERACAO IN ('S', 'E') AND
           CD_OPERACAO IN (1,2,510,511,1511,521,1521,522,960,9001,9009,9027,8750,9017,9400,9401,9402,9403,9005,545,546,555,548,1210) AND
           DT_TRANSACAO BETWEEN $1::timestamp AND $2::timestamp
         ORDER BY FATURAMENTO DESC`,
      [[dataInicio], [dataFim]],
    );

    res.json(resultado.rows);
    console.log(resultado.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

//Vendedor
app.get('/vendedor', async (req, res) => {
  const inicio = req.query.inicio;
  const fim = req.query.fim;
  const dataInicio = `${inicio} 00:00:00`;
  const dataFim = `${fim} 23:59:59`;
  try {
    const resultado = await pool.query(
      `SELECT 
       A.CD_VENDEDOR AS VENDEDOR,
       A.NM_VENDEDOR AS NOME_VENDEDOR,
       B.CD_COMPVEND,
          SUM(
      CASE
        WHEN B.TP_OPERACAO = 'E' AND B.TP_SITUACAO = 4 THEN B.QT_SOLICITADA
        ELSE 0
      END
    ) AS PAENTRADA,
    SUM(
      CASE
        WHEN B.TP_OPERACAO = 'S' AND B.TP_SITUACAO = 4 THEN B.QT_SOLICITADA
        ELSE 0
      END
    ) AS PASAIDA,
    COUNT(*) FILTER(WHERE B.TP_SITUACAO = 4 AND B.TP_OPERACAO = 'S') AS TRASAIDA,
    COUNT(*) FILTER(WHERE B.TP_SITUACAO = 4 AND B.TP_OPERACAO = 'E') AS TRAENTRADA,
    SUM(
      CASE
        WHEN B.TP_SITUACAO = 4 AND B.TP_OPERACAO = 'S' THEN B.VL_TOTAL
        WHEN B.TP_SITUACAO = 4 AND B.TP_OPERACAO = 'E' THEN -B.VL_TOTAL
        ELSE 0
      END
    ) AS FATURAMENTO
      FROM PES_VENDEDOR A
      JOIN TRA_TRANSACAO B ON A.CD_VENDEDOR = B.CD_COMPVEND
      WHERE B.TP_SITUACAO = 4
        AND B.TP_OPERACAO IN ('S', 'E')
        AND B.CD_OPERACAO IN (1,2,510,511,1511,521,1521,522,960,9001,9009,9027,8750,9017,9400,9401,9402,9403,9005,545,546,555,548,1210,1202,8800)
        AND B.DT_TRANSACAO BETWEEN $1::timestamp AND $2::timestamp
      GROUP BY A.CD_VENDEDOR, A.NM_VENDEDOR, B.CD_COMPVEND
      ORDER BY FATURAMENTO DESC;`,
      [[dataInicio], [dataFim]],
    );
    res.json(resultado.rows);
    console.log(resultado.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

//test
// app.get('/', async (req, res) => {
//   try {
//     const resultado = await pool.query(
//       'SELECT * FROM TRA_TRANSACAO WHERE CD_EMPRESA = 97',
//     );
//     console.log('olá mundo');
//     res.json(resultado.rows);
//     console.log(resultado.rows);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Erro no servidor');
//   }
// });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
