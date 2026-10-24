'use strict';
const { ApiError } = require('../utils/errors');
const logger = require('../utils/logger');
module.exports = (err, _req, res, _next) => {
  if (res.headersSent) return;
  let response = err instanceof ApiError ? err : new ApiError(500,'ERRO_INTERNO','Erro interno do servidor');
  if (err.code === 'ER_DUP_ENTRY') response = new ApiError(409,'DUPLICADO','Registro duplicado');
  if (err.code === 'ER_NO_REFERENCED_ROW_2') response = new ApiError(422,'REFERENCIA_INVALIDA','Relacionamento inexistente');
  if (err.code === 'ER_ROW_IS_REFERENCED_2') response = new ApiError(409,'VINCULO_EXISTENTE','Registro vinculado a outro');
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED' || err.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') response = new ApiError(422,'RESTRICAO_BANCO','Dados incompatíveis com restrição');
  if (response.status >= 500) logger.error('request_failed', { code: err.code || 'INTERNAL' });
  res.status(response.status).json({ error: { code: response.code, message: response.message } });
};
