'use strict';
const service = require('../services/catalog.service');
const { asyncHandler } = require('../utils/errors');
const factory = type => ({
  list: asyncHandler(async (req,res) => res.json({data: await service.list(type,req.user)})),
  get: asyncHandler(async (req,res) => res.json({data: await service.get(type,req.params.id,req.user)})),
  create: asyncHandler(async (req,res) => res.status(201).json({data: await service.create(type,req.user,req.body)})),
  patch: asyncHandler(async (req,res) => res.json({data: await service.patch(type,req.user,req.params.id,req.body)})),
  remove: asyncHandler(async (req,res) => res.json({data: await service.deactivate(type,req.user,req.params.id)}))
});
module.exports = factory;
