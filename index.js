import express from 'express';
import pool from './db.js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();


const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

const token = [{ tokenid: 12345 }];

// ========================
// ROTAS
// ========================

// Login
app.post('/login', async (req, res) => {
  const { tokenid } = req.body;
  const user = token.find((user) => user.tokenid === tokenid);
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(401).json({ message: 'Credencial inválida' });
  }
});

// Healthcheck
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// ========================
// HOME - FATURAMENTO POR EMPRESA
// ========================
app.get('/', async (req, res) => {
  const { inicio, fim } = req.query;
  const dataInicio = `${inicio} 00:00:00`;
  const dataFim = `${fim} 23:59:59`;

  const query = `
    SELECT
      A.CD_GRUPOEMPRESA,
      A.CD_PESSOA AS PESSOA_EMPRESA,
      B.CD_PESSOA AS PESSOA_JURIDICA,
      B.NM_FANTASIA AS NOME_FANTASIA,
      SUM(CASE WHEN T.TP_OPERACAO = 'E' AND T.TP_SITUACAO = 4 THEN T.QT_SOLICITADA ELSE 0 END) AS PAENTRADA,
      SUM(CASE WHEN T.TP_OPERACAO = 'S' AND T.TP_SITUACAO = 4 THEN T.QT_SOLICITADA ELSE 0 END) AS PASAIDA,
      COUNT(*) FILTER (WHERE T.TP_SITUACAO = 4 AND T.TP_OPERACAO = 'S') AS TRASAIDA,
      COUNT(*) FILTER (WHERE T.TP_SITUACAO = 4 AND T.TP_OPERACAO = 'E') AS TRAENTRADA,
      SUM(
        CASE
          WHEN T.TP_SITUACAO = 4 AND T.TP_OPERACAO = 'S' THEN T.VL_TOTAL
          WHEN T.TP_SITUACAO = 4 AND T.TP_OPERACAO = 'E' THEN -T.VL_TOTAL
          ELSE 0
        END
      ) AS FATURAMENTO
    FROM GER_EMPRESA A
    JOIN PES_PESJURIDICA B ON A.CD_PESSOA = B.CD_PESSOA
    LEFT JOIN TRA_TRANSACAO T ON T.CD_GRUPOEMPRESA = A.CD_GRUPOEMPRESA
    WHERE
      B.CD_PESSOA < 99999
      AND B.CD_PESSOA NOT IN (69994, 70596)
      AND T.VL_TOTAL > 1
      AND (
        T.TP_SITUACAO IS NULL
        OR (
          T.TP_SITUACAO = 4
          AND T.TP_OPERACAO IN ('S', 'E')
          AND T.CD_OPERACAO IN (
            1, 2, 510, 511, 1511, 521, 1521, 522,
            960, 9001, 9009, 9027, 8750, 9017,
            9400, 9401, 9402, 9403, 9005, 545,
            546, 555, 548, 1210, 9404, 9405, 1205
          )
          AND T.CD_GRUPOEMPRESA BETWEEN $1 AND $2
          AND T.DT_TRANSACAO BETWEEN $3::timestamp AND $4::timestamp
        )
      )
    GROUP BY
      A.CD_GRUPOEMPRESA, A.CD_PESSOA, B.CD_PESSOA, B.NM_FANTASIA
    ORDER BY FATURAMENTO DESC, B.NM_FANTASIA
  `
  try {
    const resultado = await pool.query(query, [1, 7000, dataInicio, dataFim]);
    res.json(resultado.rows);
    console.log('Resultado enviado com sucesso');
  } catch (err) {
    console.error('Erro na consulta:', err.message);
    res.status(500).send('Erro na consulta de dados');
  }
});

// ========================
// FATURAMENTO TOTAL
// ========================
app.get('/home', async (req, res) => {
  const { inicio, fim } = req.query;
  const dataInicio = `${inicio} 00:00:00`;
  const dataFim = `${fim} 23:59:59`;

  const query = `
    SELECT
      SUM(CASE WHEN TP_OPERACAO = 'E' AND TP_SITUACAO = 4 THEN QT_SOLICITADA ELSE 0 END) AS PAENTRADA,
      SUM(CASE WHEN TP_OPERACAO = 'S' AND TP_SITUACAO = 4 THEN QT_SOLICITADA ELSE 0 END) AS PASAIDA,
      COUNT(*) FILTER (WHERE TP_SITUACAO = 4 AND TP_OPERACAO = 'S') AS TRASAIDA,
      COUNT(*) FILTER (WHERE TP_SITUACAO = 4 AND TP_OPERACAO = 'E') AS TRAENTRADA,
      SUM(
        CASE
          WHEN TP_SITUACAO = 4 AND TP_OPERACAO = 'S' THEN VL_TOTAL
          WHEN TP_SITUACAO = 4 AND TP_OPERACAO = 'E' THEN -VL_TOTAL
          ELSE 0
        END
      ) -
      SUM(
        CASE
          WHEN TP_SITUACAO = 4 AND TP.OPERACAO IN ('S', 'E') THEN COALESCE(VL_FRETE, 0)
          ELSE 0
        END
      ) AS FATURAMENTO
    FROM TRA_TRANSACAO
    WHERE
      TP_SITUACAO = 4 AND
      TP_OPERACAO IN ('S', 'E') AND
      CD_OPERACAO IN (1, 2, 510, 511, 1511, 521, 1521, 522, 960, 9001, 1205, 9009, 9027, 8750, 9017, 9400, 9401, 9402, 9403, 9005, 545, 546, 555, 548, 1210, 9404, 9405) AND
      DT_TRANSACAO BETWEEN $1::timestamp AND $2::timestamp
    ORDER BY FATURAMENTO DESC
  `
  try {
    const resultado = await pool.query(query, [dataInicio, dataFim]);
    res.json(resultado.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// ========================
// FATURAMENTO POR VENDEDOR
// ========================
app.get('/vendedor', async (req, res) => {
  const { inicio, fim } = req.query;
  const dataInicio = `${inicio} 00:00:00`;
  const dataFim = `${fim} 23:59:59`;

  const query = `
    SELECT
      A.CD_VENDEDOR AS VENDEDOR,
      A.NM_VENDEDOR AS NOME_VENDEDOR,
      B.CD_COMPVEND,
      SUM(CASE WHEN B.TP_OPERACAO = 'E' AND B.TP_SITUACAO = 4 THEN B.QT_SOLICITADA ELSE 0 END) AS PAENTRADA,
      SUM(CASE WHEN B.TP_OPERACAO = 'S' AND B.TP_SITUACAO = 4 THEN B.QT_SOLICITADA ELSE 0 END) AS PASAIDA,
      COUNT(*) FILTER (WHERE B.TP_SITUACAO = 4 AND B.TP_OPERACAO = 'S') AS TRASAIDA,
      COUNT(*) FILTER (WHERE B.TP_SITUACAO = 4 AND B.TP_OPERACAO = 'E') AS TRAENTRADA,
      SUM(
        CASE
          WHEN B.TP_SITUACAO = 4 AND B.TP_OPERACAO = 'S' THEN B.VL_TOTAL
          WHEN B.TP_SITUACAO = 4 AND B.TP_OPERACAO = 'E' THEN -B.VL_TOTAL
          ELSE 0
        END
      ) -
      SUM(
        CASE
          WHEN B.TP_SITUACAO = 4 AND B.TP_OPERACAO IN ('S', 'E') THEN COALESCE(B.VL_FRETE, 0)
          ELSE 0
        END
      ) AS FATURAMENTO
    FROM PES_VENDEDOR A
    JOIN TRA_TRANSACAO B ON A.CD_VENDEDOR = B.CD_COMPVEND
    WHERE
      B.TP_SITUACAO = 4 AND
      B.TP_OPERACAO IN ('S', 'E') AND
      B.CD_OPERACAO IN (1,2,510,511,1511,521,1205,1521,522,960,9001,9009,9027,8750,9017,9400,9401,9402,9403,9005,545,546,555,548,1210,1202,8800,9404,9405,1205) AND
      B.DT_TRANSACAO BETWEEN $1::timestamp AND $2::timestamp
    GROUP BY A.CD_VENDEDOR, A.NM_VENDEDOR, B.CD_COMPVEND
    ORDER BY FATURAMENTO DESC
  `;

  try {
    const resultado = await pool.query(query, [dataInicio, dataFim]);
    res.json(resultado.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// ========================
// ESTOQUE
// ========================
app.get('/estoque', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        A.cd_grupoempresa,
        PJ.nm_fantasia AS nome,
        SUM(A.qt_saldo) AS saldo,
        SUM(V.vl_produto * A.qt_saldo) AS valor
      FROM vr_prd_saldo A
      JOIN (
        SELECT *
        FROM (
          SELECT *,
                ROW_NUMBER() OVER (PARTITION BY cd_produto ORDER BY dt_cadastro DESC) AS rn
          FROM vr_prd_valorprod
          WHERE ds_valor = 'VENDA VAREJO'
        ) sub
        WHERE rn = 1
      ) V ON A.cd_produto = V.cd_produto
      JOIN ger_empresa E ON A.cd_grupoempresa = E.cd_grupoempresa
      JOIN pes_pesjuridica PJ ON E.cd_pessoa = PJ.cd_pessoa
      WHERE
        A.cd_grupoempresa >= 6000 AND
        A.qt_saldo != 0 AND
        PJ.nm_fantasia IS NOT NULL AND
        PJ.nm_fantasia NOT ILIKE '%TESTE%' AND
        A.cd_produto NOT IN (
          29406, 29387, 29647, 32570, 32571, 32691, 29609, 29610, 29646,
          39413, 34538, 4538, 34710, 29607, 29648, 39897, 29400, 44879,
          5000033, 44725, 49084, 38071, 29397, 5000015, 64568, 64570
        )
      GROUP BY A.cd_grupoempresa, PJ.nm_fantasia
      ORDER BY A.cd_grupoempresa ASC
    `);
    res.json(resultado.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// ========================
// PCP
// ========================
app.get('/pcp', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT * FROM vw_detalhe_pedido_completo WHERE cd_empresa = 111
    `);
    res.json(resultado.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// ========================
// EXPEDIÇÃO
// ========================
app.get('/expedicao', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT * FROM vw_detalhe_pedido_completo WHERE cd_empresa = 850 AND cd_tabpreco IN (21, 22)
    `);
    res.json(resultado.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// ========================
// TESTE
// ========================
app.get('/test', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT * FROM TRA_TRANSACAO WHERE CD_GRUPOEMPRESA = 95 AND dt_transacao = '2025-05-03'
    `);
    res.json(resultado.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// ========================
// SERVIDOR
// ========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
