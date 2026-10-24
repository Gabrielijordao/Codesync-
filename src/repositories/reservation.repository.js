'use strict';
const pool = require('../config/database');
async function find(id, tx = pool, lock = false) {
  const [rows] = await tx.execute(
    `SELECT r.*, sr.codigo AS status_codigo FROM tb_reserva r
     JOIN tb_status_reserva sr ON sr.id_status_reserva = r.id_status_reserva
     WHERE r.id_reserva = ? ${lock ? 'FOR UPDATE' : ''}`, [id]);
  return rows[0] || null;
}
async function listFor(user) {
  const isAdmin = user.tipo_usuario === 'ADMIN';
  const [rows] = await pool.execute(
    `SELECT r.*, sr.codigo AS status_codigo FROM tb_reserva r
     JOIN tb_status_reserva sr ON sr.id_status_reserva = r.id_status_reserva
     ${isAdmin ? '' : 'WHERE r.id_usuario = ?'}
     ORDER BY r.data_reserva DESC LIMIT 100`, isAdmin ? [] : [user.id_usuario]);
  return rows;
}
async function statusId(code, tx = pool) {
  const [rows] = await tx.execute('SELECT id_status_reserva FROM tb_status_reserva WHERE codigo = ?', [code]);
  if (!rows[0]) throw new Error(`Falta status de reserva: ${code}. Execute 02_seed.sql.`);
  return rows[0].id_status_reserva;
}
async function anyPayment(id, tx = pool) {
  const [rows] = await tx.execute('SELECT 1 FROM tb_pagamento WHERE id_reserva = ? LIMIT 1', [id]);
  return rows.length > 0;
}
module.exports = { find, listFor, statusId, anyPayment };
