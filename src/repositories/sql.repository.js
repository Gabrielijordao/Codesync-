'use strict';
const pool = require('../config/database');
/** Campos/tabelas vindos apenas de configuracoes internas (nunca de entrada HTTP). */
function quote(name) {
  if (!/^[a-z_][a-z0-9_]*$/.test(name)) throw new Error('Identificador SQL invalido');
  return `\`${name}\``;
}
async function findById(table, primaryKey, id, executor = pool) {
  const [rows] = await executor.execute(
    `SELECT * FROM ${quote(table)} WHERE ${quote(primaryKey)} = ? LIMIT 1`, [id]);
  return rows[0] || null;
}
async function list(table, criteria = {}, executor = pool) {
  const filters = Object.entries(criteria);
  const where = filters.length
    ? ` WHERE ${filters.map(([key]) => `${quote(key)} = ?`).join(' AND ')}` : '';
  const [rows] = await executor.execute(
    `SELECT * FROM ${quote(table)}${where} ORDER BY 1 DESC LIMIT 100`, filters.map(([,v]) => v));
  return rows;
}
async function create(table, data, executor = pool) {
  const entries = Object.entries(data);
  if (!entries.length) throw new Error('Sem dados para inserir');
  const sql = `INSERT INTO ${quote(table)} (${entries.map(([k])=>quote(k)).join(',')}) VALUES (${entries.map(()=>'?').join(',')})`;
  const [result] = await executor.execute(sql, entries.map(([,v])=>v));
  return String(result.insertId);
}
async function update(table, pk, id, data, executor = pool) {
  const entries = Object.entries(data);
  if (!entries.length) return 0;
  const sql = `UPDATE ${quote(table)} SET ${entries.map(([k])=>`${quote(k)} = ?`).join(', ')} WHERE ${quote(pk)} = ?`;
  const [result] = await executor.execute(sql, [...entries.map(([,v])=>v), id]);
  return result.affectedRows;
}
async function remove(table, pk, id, executor = pool) {
  const [r] = await executor.execute(`DELETE FROM ${quote(table)} WHERE ${quote(pk)} = ?`, [id]);
  return r.affectedRows;
}
module.exports = { findById, list, create, update, remove };
