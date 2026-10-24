'use strict';
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const env = require('./config/env');
const {ApiError,asyncHandler} = require('./utils/errors');
const pool = require('./config/database');
const audit = require('./middlewares/audit');
const errorHandler = require('./middlewares/error-handler');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy',env.TRUST_PROXY_HOPS);
app.use(helmet());
const origins = env.CORS_ORIGINS.split(',').map(x=>x.trim()).filter(Boolean);
app.use(cors({origin:(origin,cb)=>cb(null,!origin||origins.includes(origin))}));
app.use(express.json({limit:'100kb'}));
app.use((err,req,res,next) => err instanceof SyntaxError && 'body' in err
  ? next(new ApiError(400,'JSON_INVALIDO','Corpo JSON invalido')) : next(err));
app.use(audit);
app.get('/health', asyncHandler(async (_req,res) => {
  await pool.query('SELECT 1');
  res.json({status:'ok',service:'hospedja-api'});
}));
const apiSpec = YAML.load(path.join(__dirname, 'docs', 'openapi.yaml'));
app.get('/openapi.json', (_req,res) => res.json(apiSpec));
// A interface Swagger usa scripts inline. Excecao de CSP restrita a documentacao.
app.use('/api-docs', (_req,res,next) => { res.removeHeader('Content-Security-Policy'); next(); },
  swaggerUi.serve, swaggerUi.setup(apiSpec, { explorer:false }));
app.use('/api/v1/auth',require('./routes/auth.routes'));
app.use('/api/v1/usuarios',require('./routes/users.routes'));
app.use('/api/v1/hoteis',require('./routes/catalog.routes')('hoteis'));
app.use('/api/v1/quartos',require('./routes/catalog.routes')('quartos'));
app.use('/api/v1/guias',require('./routes/catalog.routes')('guias'));
app.use('/api/v1/reservas',require('./routes/reservation.routes'));
app.use('/api/v1/pagamentos',require('./routes/payment.routes'));
app.use('/api/v1/ocorrencias',require('./routes/occurrence.routes'));
app.use((_req,_res,next)=>next(new ApiError(404,'ROTA_NAO_ENCONTRADA','Endpoint nao encontrado')));
app.use(errorHandler);
module.exports = app;
