'use strict';
const app = require('./app');
const env = require('./config/env');
const pool = require('./config/database');
const logger = require('./utils/logger');
(async () => {
  // Falha de banco deve impedir disponibilidade aparente da API.
  await pool.query('SELECT 1');
  const server=app.listen(env.PORT,'0.0.0.0',()=>logger.info('server_started',{port:env.PORT}));
  for (const sig of ['SIGINT','SIGTERM']) process.on(sig,()=>{
    server.close(async ()=>{await pool.end();process.exit(0);});
  });
})().catch(err=>{
  logger.error('startup_failed',{code:err.code||'UNKNOWN'});
  process.exit(1);
});
