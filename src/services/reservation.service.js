'use strict';
const crypto = require('crypto');
const pool = require('../config/database');
const reservations = require('../repositories/reservation.repository');
const { fail } = require('../utils/errors');
async function list(user) { return reservations.listFor(user); }
async function get(user,id) {
  const r = await reservations.find(id);
  if (!r) fail(404,'NAO_ENCONTRADO','Reserva nao encontrada');
  if (user.tipo_usuario !== 'ADMIN' && String(r.id_usuario) !== String(user.id_usuario)) fail(403,'ACESSO_NEGADO','Reserva de outro usuario');
  return r;
}
async function create(user,data) {
  // PENDENTE = registro preliminar. Sem cotacao, pagamento ou bloqueio de estoque.
  if (data.checkin <= new Date().toISOString().slice(0,10)) fail(422,'DATA_INVALIDA','Check-in precisa ser futuro');
  const tx = await pool.getConnection();
  let id;
  try {
    await tx.beginTransaction();
    const status = await reservations.statusId('PENDENTE',tx);
    const code = `HJ-${crypto.randomUUID().replace(/-/g,'').slice(0,24).toUpperCase()}`;
    const [result] = await tx.execute(
      `INSERT INTO tb_reserva (id_usuario,id_status_reserva,codigo_confirmacao,checkin,checkout,quantidade_hospedes,valor_total,taxas,observacoes)
       VALUES (?,?,?,?,?,?,0,0,?)`,
      [user.id_usuario,status,code,data.checkin,data.checkout,data.quantidade_hospedes,data.observacoes ?? null]
    );
    id = String(result.insertId);
    await tx.execute(`INSERT INTO tb_reserva_status (id_reserva,id_status_reserva,id_usuario,observacao)
      VALUES (?,?,?,'Rascunho pendente criado pela API')`,[id,status,user.id_usuario]);
    await tx.commit();
  } catch(err) { await tx.rollback(); throw err; }
  finally { tx.release(); }
  return get(user,id);
}
async function patch(user,id,data) {
  const current = await get(user,id);
  if (current.status_codigo !== 'PENDENTE') fail(409,'ESTADO_INVALIDO','Somente rascunhos pendentes podem ser alterados');
  if (!Object.keys(data).length) fail(422,'DADOS_INVALIDOS','Envie algum campo');
  await pool.execute('UPDATE tb_reserva SET observacoes = ? WHERE id_reserva = ?', [data.observacoes ?? null,id]);
  return get(user,id);
}
async function cancelPendingDraft(user,id) {
  // Intencionalmente NAO cancela reservas confirmadas nem executa estorno.
  const tx = await pool.getConnection();
  try {
    await tx.beginTransaction();
    const r = await reservations.find(id,tx,true);
    if (!r) fail(404,'NAO_ENCONTRADO','Reserva nao encontrada');
    if (user.tipo_usuario !== 'ADMIN' && String(r.id_usuario) !== String(user.id_usuario)) fail(403,'ACESSO_NEGADO','Reserva de outro usuario');
    if (r.status_codigo !== 'PENDENTE' || await reservations.anyPayment(id,tx))
      fail(409,'CANCELAMENTO_INDISPONIVEL','Cancelamento com pagamento ou reserva confirmada sera implementado na etapa de regras de negocio');
    const status = await reservations.statusId('CANCELADA',tx);
    await tx.execute('UPDATE tb_reserva SET id_status_reserva = ? WHERE id_reserva = ?', [status,id]);
    await tx.execute(`INSERT INTO tb_reserva_status (id_reserva,id_status_reserva,id_usuario,observacao)
      VALUES (?,?,?,'Rascunho sem pagamento cancelado')`, [id,status,user.id_usuario]);
    await tx.commit();
    return {id,status:'CANCELADA'};
  } catch(err) { await tx.rollback(); throw err; }
  finally { tx.release(); }
}
module.exports = { list, get, create, patch, cancelPendingDraft };
