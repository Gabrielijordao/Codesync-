'use strict';
const pool = require('../config/database');
const sql = require('./sql.repository');
const publicFields = 'id_usuario,nome,email,telefone,data_nascimento,tipo_usuario,status,data_cadastro,atualizado_em';
async function byEmail(email) {
  const [rows] = await pool.execute('SELECT * FROM tb_usuario WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}
async function byId(id) {
  const [rows] = await pool.execute(`SELECT ${publicFields} FROM tb_usuario WHERE id_usuario = ?`, [id]);
  return rows[0] || null;
}
async function all() {
  const [rows] = await pool.query(`SELECT ${publicFields} FROM tb_usuario ORDER BY id_usuario DESC LIMIT 100`);
  return rows;
}
function create(data) { return sql.create('tb_usuario', data); }
function update(id, data) { return sql.update('tb_usuario','id_usuario',id,data); }
module.exports = { byEmail, byId, all, create, update };
