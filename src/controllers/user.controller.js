'use strict';
const users = require('../services/user.service');
const auth = require('../services/auth.service');
const { asyncHandler } = require('../utils/errors');
const createStaff = asyncHandler(async (req,res) =>
  res.status(201).json({data: await auth.registerStaff(req.body)}));
const me = asyncHandler(async (req,res) => res.json({data: await users.get(req.user.id_usuario)}));
const updateMe = asyncHandler(async (req,res) =>
  res.json({data: await users.updateOwn(req.user.id_usuario,req.body)}));
const all = asyncHandler(async (_req,res) => res.json({data: await users.list()}));
const get = asyncHandler(async (req,res) => res.json({data: await users.get(req.params.id)}));
const updateStatus = asyncHandler(async (req,res) =>
  res.json({data: await users.adminSetStatus(req.params.id,req.body.status)}));
module.exports = { me, updateMe, all, get, updateStatus, createStaff };
