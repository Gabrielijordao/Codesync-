'use strict';
const audit = require('../services/audit.service');
function auditMiddleware(req, res, next) {
  res.on('finish', () => {
    if (req.path === '/health') return;
    if (!['POST','PUT','PATCH','DELETE'].includes(req.method)) return;
    const segments = req.path.split('/').filter(Boolean);
    const resource = segments[2] || 'unknown';
    const action = resource === 'auth'
      ? (segments[3] === 'login' ? 'AUTENTICACAO' : 'CADASTRO')
      : `${resource.toUpperCase()}_${req.method}`;
    const result = res.statusCode < 400 ? 'SUCESSO' : (res.statusCode === 401 || res.statusCode === 403 ? 'NEGADO' : 'FALHA');
    void audit.record({ userId: req.user?.id_usuario || null,
      profile: req.user?.tipo_usuario || null, action, operation: req.method,
      entity: resource.toUpperCase(), recordId: /^\d+$/.test(segments[3]||'') ? segments[3] : null,
      result, ip: req.ip,
      details: { method: req.method, route: '/api/v1/' + resource, httpStatus: res.statusCode }
    });
  });
  next();
}
module.exports = auditMiddleware;
