'use strict';
const { asyncHandler, fail } = require('../utils/errors');
const { verifyToken } = require('../utils/security');
const users = require('../repositories/user.repository');
const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  if (!/^Bearer\s+\S+$/i.test(header)) fail(401,'NAO_AUTENTICADO','Token Bearer necessario');
  let claims;
  try { claims = verifyToken(header.replace(/^Bearer\s+/i,'')); }
  catch { fail(401,'TOKEN_INVALIDO','Token ausente, invalido ou expirado'); }
  if (!/^\d+$/.test(String(claims.sub))) fail(401,'TOKEN_INVALIDO','Token invalido');
  const user = await users.byId(claims.sub);
  if (!user || user.status !== 'ATIVO') fail(401,'USUARIO_INATIVO','Conta indisponivel');
  req.user = user; // papel vem sempre do banco, nao do token
  next();
});
const allowRoles = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new Error('Middleware de autenticacao ausente'));
  if (!roles.includes(req.user.tipo_usuario)) fail(403,'ACESSO_NEGADO','Perfil sem permissao');
  next();
};
module.exports = { requireAuth, allowRoles };
// Rotas de consulta publica podem identificar admins se houver token valido.
const optionalAuth = (req,res,next) => req.headers.authorization ? requireAuth(req,res,next) : next();
module.exports.optionalAuth = optionalAuth;
