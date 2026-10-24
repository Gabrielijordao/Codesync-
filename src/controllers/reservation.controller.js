'use strict';
const service = require('../services/reservation.service');
const { asyncHandler } = require('../utils/errors');
module.exports = {
  list: asyncHandler(async (req,res) => res.json({data:await service.list(req.user)})),
  get: asyncHandler(async (req,res) => res.json({data:await service.get(req.user,req.params.id)})),
  create: asyncHandler(async (req,res) => res.status(201).json({data:await service.create(req.user,req.body)})),
  patch: asyncHandler(async (req,res) => res.json({data:await service.patch(req.user,req.params.id,req.body)})),
  cancel: asyncHandler(async (req,res) => res.json({data:await service.cancelPendingDraft(req.user,req.params.id)}))
};
