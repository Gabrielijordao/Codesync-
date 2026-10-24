'use strict';
const pool = require('../config/database');
const { fail } = require('../utils/errors');
const { get: reservation } = require('./reservation.service');
async function get(user,id) {
  const [rows] = await pool.execute(`SELECT p.*, s.codigo AS status_codigo, r.id_usuario
    FROM tb_pagamento p JOIN tb_status_pagamento s ON s.id_status_pagamento = p.id_status_pagamento
    JOIN tb_reserva r ON r.id_reserva = p.id_reserva WHERE p.id_pagamento = ?`, [id]);
  const p=rows[0];
  if (!p) fail(404,'NAO_ENCONTRADO','Pagamento nao encontrado');
  if (user.tipo_usuario !== 'ADMIN' && String(p.id_usuario) !== String(user.id_usuario)) fail(403,'ACESSO_NEGADO','Pagamento de outro usuario');
  // Nunca retornar identificadores de transacao externa para cliente.
  if (user.tipo_usuario !== 'ADMIN') delete p.transacao_externa_id;
  return p;
}
async function list(user) {
  const isAdmin = user.tipo_usuario === 'ADMIN';
  const [rows] = await pool.execute(`SELECT p.id_pagamento,p.id_reserva,p.id_status_pagamento,
    p.provedor,p.valor,p.metodo,p.criado_em,p.data_pagamento,s.codigo AS status_codigo
    FROM tb_pagamento p JOIN tb_status_pagamento s ON s.id_status_pagamento = p.id_status_pagamento
    JOIN tb_reserva r ON r.id_reserva = p.id_reserva
    ${isAdmin ? '' : 'WHERE r.id_usuario = ?'} ORDER BY p.id_pagamento DESC LIMIT 100`,
    isAdmin ? [] : [user.id_usuario]);
  return rows;
}
async function createInternal(user,data) {
  if (user.tipo_usuario !== 'ADMIN') fail(403,'ACESSO_NEGADO','Criacao de pagamento exige administrador');
  const r = await reservation(user,data.id_reserva);
  if (r.status_codigo !== 'PENDENTE') fail(409,'ESTADO_INVALIDO','Reserva nao esta pendente');
  const [status] = await pool.execute(`SELECT id_status_pagamento FROM tb_status_pagamento WHERE codigo = 'PENDENTE'`);
  if (!status[0]) fail(500,'CONFIGURACAO_INCOMPLETA','Execute os inserts de status do seed');
  const tx = await pool.getConnection();
  let id;
  try {
    await tx.beginTransaction();
    const [result] = await tx.execute(`INSERT INTO tb_pagamento (id_reserva,id_status_pagamento,valor,metodo)
      VALUES (?,?,?,?)`,[data.id_reserva,status[0].id_status_pagamento,data.valor,data.metodo ?? null]);
    id=String(result.insertId);
    await tx.execute(`INSERT INTO tb_pagamento_status
      (id_pagamento,id_status_pagamento,id_usuario,observacao)
      VALUES (?,?,?,'Registro preliminar; sem transacao Mercado Pago')`,
      [id,status[0].id_status_pagamento,user.id_usuario]);
    await tx.commit();
  } catch(err) { await tx.rollback(); throw err; }
  finally { tx.release(); }
  return get(user,id);
}
module.exports = { list, get, createInternal };
