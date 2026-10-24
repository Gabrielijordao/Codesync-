'use strict';
const router = require('express').Router();
const { z } = require('zod');
const validate = require('../middlewares/validate');
const schemas = require('../validators/schemas');
const ctrl = require('../controllers/user.controller');
const { requireAuth,allowRoles } = require('../middlewares/auth');
router.use(requireAuth);
router.get('/me',ctrl.me);
router.patch('/me',validate(schemas.profilePatch),ctrl.updateMe);
router.use(allowRoles('ADMIN'));
router.get('/',ctrl.all);
router.post('/',validate(schemas.staffCreate),ctrl.createStaff);
router.get('/:id',validate(z.object({id:schemas.bigintId}),'params'),ctrl.get);
router.patch('/:id/status',validate(z.object({id:schemas.bigintId}),'params'),
  validate(z.object({status:z.enum(['ATIVO','INATIVO','BLOQUEADO'])}).strict()),ctrl.updateStatus);
module.exports=router;
