'use strict';
const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const validate = require('../middlewares/validate');
const schemas = require('../validators/schemas');
const ctrl = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth');
const authLimiter = rateLimit({windowMs:15*60*1000,limit:15,standardHeaders:'draft-7',legacyHeaders:false,
  message: {error:{code:'MUITAS_TENTATIVAS',message:'Tente novamente mais tarde'}}});
router.post('/register',authLimiter,validate(schemas.registration),ctrl.register);
router.post('/login',authLimiter,validate(schemas.login),ctrl.login);
router.patch('/password',requireAuth,validate(schemas.passwordPatch),ctrl.changePassword);
module.exports = router;
