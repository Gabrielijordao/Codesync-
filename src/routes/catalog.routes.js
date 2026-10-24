'use strict';
const {z} = require('zod');
const validate = require('../middlewares/validate');
const s = require('../validators/schemas');
const ctrl = require('../controllers/catalog.controller');
const {requireAuth,optionalAuth,allowRoles} = require('../middlewares/auth');
module.exports = (resource) => {
  const router = require('express').Router();
  const c = ctrl(resource);
  const schemas = {
    hoteis:[s.hotelCreate,s.hotelPatch],
    quartos:[s.quartoCreate,s.quartoPatch],
    guias:[s.guiaCreate,s.guiaPatch]
  }[resource];
  router.get('/',optionalAuth,c.list);
  router.get('/:id',optionalAuth,validate(z.object({id:s.bigintId}),'params'),c.get);
  router.post('/',requireAuth,validate(schemas[0]),c.create);
  router.patch('/:id',requireAuth,validate(z.object({id:s.bigintId}),'params'),validate(schemas[1]),c.patch);
  router.delete('/:id',requireAuth,validate(z.object({id:s.bigintId}),'params'),c.remove);
  if(resource === 'hoteis') {
    const manager = require('../controllers/manager.controller');
    router.post('/:id/gestores',requireAuth,allowRoles('ADMIN'),
      validate(z.object({id:s.bigintId}),'params'),
      validate(z.object({id_usuario:s.bigintId}).strict()),manager.attach);
    router.delete('/:id/gestores/:usuarioId',requireAuth,allowRoles('ADMIN'),
      validate(z.object({id:s.bigintId,usuarioId:s.bigintId}),'params'),manager.detach);
  }
  return router;
};
