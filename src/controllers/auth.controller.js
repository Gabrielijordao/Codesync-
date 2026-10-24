'use strict';
const auth = require('../services/auth.service');
const { asyncHandler } = require('../utils/errors');
const register = asyncHandler(async (req,res) => {
  const user = await auth.register(req.body);
  req.user = user;
  res.status(201).json({ data: user });
});
const login = asyncHandler(async (req,res) => {
  const data = await auth.authenticate(req.body);
  req.user = data.user;
  res.json({data});
});
const changePassword = asyncHandler(async (req,res) => {
  await auth.changePassword(req.user.id_usuario,req.body);
  res.status(204).end();
});
module.exports = { register, login, changePassword };
