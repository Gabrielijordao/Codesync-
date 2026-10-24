'use strict';
const sql = require('../repositories/sql.repository');
const pool = require('../config/database');
const access = require('../repositories/access.repository');
const { fail } = require('../utils/errors');
const MODELS = {
  hoteis: { table:'tb_hotel', pk:'id_hotel', type:'HOTEL' },
  quartos: { table:'tb_tipo_quarto', pk:'id_tipo_quarto', type:'QUARTO' },
  guias: { table:'tb_guia', pk:'id_guia', type:'GUIA' }
};
const admin = user => user?.tipo_usuario === 'ADMIN';
const isManager = user => user?.tipo_usuario === 'GESTOR_HOSPEDAGEM';
const normalize = (type, body) => {
  if (type === 'hoteis' && body.comodidades !== undefined) {
    return { ...body, comodidades: body.comodidades === null ? null : JSON.stringify(body.comodidades) };
  }
  return body;
};
const visible = (type, item) => type === 'hoteis' ? item.status === 'ATIVO'
  : type === 'quartos' ? item.status === 'DISPONIVEL'
  : item.status === 'ATIVO' && item.status_aprovacao === 'APROVADO';
function output(type, item, user) {
  if (!item) return item;
  if (type !== 'guias' || admin(user) || (user && String(item.id_usuario) === String(user.id_usuario))) return item;
  const { documento_identidade, id_usuario, email, telefone, ...safe } = item;
  return safe;
}
async function parentIsActive(type,item) {
  if (type !== 'quartos') return true;
  const hotel = await sql.findById('tb_hotel','id_hotel',item.id_hotel);
  return hotel?.status === 'ATIVO';
}
async function list(type, user) {
  const cfg = MODELS[type];
  const result = await sql.list(cfg.table);
  if (admin(user)) return result;
  if (type === 'quartos') {
    const [rows] = await pool.query(`SELECT q.* FROM tb_tipo_quarto q
      JOIN tb_hotel h ON h.id_hotel=q.id_hotel
      WHERE q.status='DISPONIVEL' AND h.status='ATIVO'
      ORDER BY q.id_tipo_quarto DESC LIMIT 100`);
    return rows;
  }
  return result.filter(item => visible(type,item)).map(item => output(type,item,user));
}
async function get(type, id, user) {
  const cfg = MODELS[type];
  const item = await sql.findById(cfg.table,cfg.pk,id);
  if (!item) fail(404,'NAO_ENCONTRADO','Registro nao encontrado');
  if ((!visible(type,item) || !await parentIsActive(type,item)) && !admin(user) && !await owns(type,user,item))
    fail(404,'NAO_ENCONTRADO','Registro nao encontrado');
  return output(type,item,user);
}
async function owns(type, user, item) {
  if (!user) return false;
  if (type === 'guias') return user.tipo_usuario === 'GUIA' && String(item.id_usuario) === String(user.id_usuario);
  const hotelId = type === 'hoteis' ? item.id_hotel : item.id_hotel;
  return isManager(user) && await access.managesHotel(user.id_usuario,hotelId);
}
async function assertCanEdit(type, user, item) {
  if (admin(user)) return;
  if (await owns(type,user,item)) return;
  fail(403,'ACESSO_NEGADO','Sem permissao para modificar este registro');
}
async function create(type, user, body) {
  if (type === 'hoteis' || type === 'guias') {
    if (!admin(user)) fail(403,'ACESSO_NEGADO','Cadastro exige administrador');
  } else if (!admin(user) && !(isManager(user) && await access.managesHotel(user.id_usuario,body.id_hotel))) {
    fail(403,'ACESSO_NEGADO','Gestor nao vinculado a hospedagem');
  }
  if (type === 'guias' && body.tipo_guia === 'INTERNO') {
    if (!body.id_usuario) fail(422,'USUARIO_OBRIGATORIO','Guia interno exige usuario vinculado');
    const linked = await sql.findById('tb_usuario','id_usuario',body.id_usuario);
    if (!linked || linked.tipo_usuario !== 'GUIA') fail(422,'PERFIL_INVALIDO','Usuario vinculado precisa ter perfil GUIA');
  }
  if (type === 'guias' && body.tipo_guia === 'EXTERNO' && body.id_usuario)
    fail(422,'PERFIL_INVALIDO','Guia externo nao possui acesso vinculado');
  const cfg = MODELS[type];
  const id = await sql.create(cfg.table,normalize(type,body));
  return sql.findById(cfg.table,cfg.pk,id);
}
async function patch(type,user,id,body) {
  const cfg = MODELS[type];
  const item = await sql.findById(cfg.table,cfg.pk,id);
  if (!item) fail(404,'NAO_ENCONTRADO','Registro nao encontrado');
  await assertCanEdit(type,user,item);
  if (type === 'guias' && !admin(user)) {
    const denied = ['status','status_aprovacao','documento_identidade'];
    if (denied.some(k=>Object.hasOwn(body,k))) fail(403,'CAMPO_PROTEGIDO','Campo reservado a administradores');
  }
  if (type === 'hoteis' && !admin(user) && (Object.hasOwn(body,'status') || Object.hasOwn(body,'id_rede')))
    fail(403,'CAMPO_PROTEGIDO','Status e rede reservados a administradores');
  if (!Object.keys(body).length) fail(422,'DADOS_INVALIDOS','Envie ao menos um campo');
  await sql.update(cfg.table,cfg.pk,id,normalize(type,body));
  return sql.findById(cfg.table,cfg.pk,id);
}
async function deactivate(type,user,id) {
  const cfg = MODELS[type];
  const item = await sql.findById(cfg.table,cfg.pk,id);
  if (!item) fail(404,'NAO_ENCONTRADO','Registro nao encontrado');
  await assertCanEdit(type,user,item);
  if (type === 'hoteis' && !admin(user)) fail(403,'ACESSO_NEGADO','Desativacao de hospedagem exige administrador');
  await sql.update(cfg.table,cfg.pk,id, { status: type === 'quartos' ? 'INDISPONIVEL' : 'INATIVO' });
  return { id, status: type === 'quartos' ? 'INDISPONIVEL' : 'INATIVO' };
}
module.exports = { list, get, create, patch, deactivate };
