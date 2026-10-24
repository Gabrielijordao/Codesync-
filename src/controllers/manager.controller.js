'use strict';
const service = require('../services/manager.service');
const {asyncHandler} = require('../utils/errors');
module.exports = {
  attach: asyncHandler(async(req,res)=>res.status(201).json({
    data:await service.attach(req.params.id,req.body.id_usuario)
  })),
  detach: asyncHandler(async(req,res)=>res.json({
    data:await service.detach(req.params.id,req.params.usuarioId)
  }))
};
