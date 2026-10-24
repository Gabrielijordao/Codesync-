'use strict';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const hashPassword = password => bcrypt.hash(password, env.BCRYPT_ROUNDS);
const verifyPassword = (password, hash) => bcrypt.compare(password, hash);
const signToken = user => jwt.sign(
  { sub: String(user.id_usuario) }, env.JWT_SECRET,
  { algorithm: 'HS256', expiresIn: env.JWT_EXPIRES_IN, issuer: 'hospedja', audience: 'hospedja-api' }
);
const verifyToken = token => jwt.verify(token, env.JWT_SECRET, {
  algorithms: ['HS256'], issuer: 'hospedja', audience: 'hospedja-api'
});
module.exports = { hashPassword, verifyPassword, signToken, verifyToken };
