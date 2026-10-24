'use strict';
const users = require('../repositories/user.repository');
const { fail } = require('../utils/errors');
async function get(id) {
  const u = await users.byId(id);
  if (!u) fail(404,'NAO_ENCONTRADO','Usuario nao encontrado');
  return u;
}
async function updateOwn(id, body) { await users.update(id,body); return get(id); }
async function adminSetStatus(id, status) {
  if (status === 'BLOQUEADO' || status === 'INATIVO' || status === 'ATIVO') {
    await get(id); await users.update(id, { status }); return get(id);
  }
  fail(422,'STATUS_INVALIDO','Status invalido');
}
module.exports = { get, updateOwn, adminSetStatus, list: users.all };
