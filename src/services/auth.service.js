'use strict';
const users = require('../repositories/user.repository');
const { hashPassword, verifyPassword, signToken } = require('../utils/security');
const { fail } = require('../utils/errors');
const bcrypt = require('bcrypt');
async function register(data,role = 'CLIENTE') {
  const registered = await users.byEmail(data.email);
  if (registered) fail(409,'EMAIL_CADASTRADO','Email ja cadastrado');
  const hash = await hashPassword(data.senha);
  const id = await users.create({
    nome: data.nome, email: data.email, senha_hash: hash,
    telefone: data.telefone ?? null, data_nascimento: data.data_nascimento ?? null,
    tipo_usuario: role
  });
  return users.byId(id);
}
async function authenticate(data) {
  const user = await users.byEmail(data.email);
  // Comparacao dummy evita diferencas triviais entre email inexistente e senha errada.
  const dummyHash = '$2b$12$C6UzMDM.H6dfI/f/IKcEeOmzSa62HaBGYk9IjqqFYikAc1mc/Oh/a';
  const ok = await verifyPassword(data.senha, user?.senha_hash || dummyHash);
  if (!user || !ok || user.status !== 'ATIVO') fail(401,'CREDENCIAIS_INVALIDAS','Credenciais invalidas');
  return { token: signToken(user), token_type: 'Bearer', expires_in: require('../config/env').JWT_EXPIRES_IN, user: await users.byId(user.id_usuario) };
}
async function changePassword(userId, data) {
  const profile = await users.byId(userId);
  if (!profile) fail(404,'NAO_ENCONTRADO','Usuario nao encontrado');
  const user = await users.byEmail(profile.email);
  if (!await bcrypt.compare(data.atual, user.senha_hash)) fail(401,'SENHA_ATUAL_INVALIDA','Senha atual invalida');
  await users.update(userId, { senha_hash: await hashPassword(data.nova) });
}
module.exports = { register, registerStaff: data => register(data,data.tipo_usuario), authenticate, changePassword };
