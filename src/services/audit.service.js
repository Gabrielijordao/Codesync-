'use strict';
const pool = require('../config/database');
const logger = require('../utils/logger');
async function record({ userId = null, profile = null, action, operation = null,
  entity = null, recordId = null, result, ip = null, details = {} }) {
  // Nunca aceitar corpo de requisicao, senha, token ou cabecalhos nos detalhes.
  const safe = {
    method: String(details.method || '').slice(0,10),
    route: String(details.route || '').slice(0,150),
    http_status: Number(details.httpStatus) || null
  };
  try {
    await pool.execute(`INSERT INTO tb_log
      (id_usuario, perfil, acao, operacao, entidade, id_registro, resultado, origem, detalhes, ip)
      VALUES (?,?,?,?,?,?,?,'API',?,?)`,
      [userId,profile,action,operation,entity,recordId,result,JSON.stringify(safe),ip]);
  } catch (err) {
    logger.error('audit_database_failed', { code: err.code || 'UNKNOWN' });
  }
  logger.info('audit_event', { userId, action, operation, entity, recordId, result, ip, ...safe });
}
module.exports = { record };
