'use strict';
const winston = require('winston');
const env = require('../config/env');
const transport = env.LOG_FILE
  ? new winston.transports.File({ filename: env.LOG_FILE })
  : new winston.transports.Console();
module.exports = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [transport]
});
