'use strict';
const mysql = require('mysql2/promise');
const fs = require('fs');
const env = require('./env');
const pool = mysql.createPool({
  host: env.DB_HOST, port: env.DB_PORT, user: env.DB_USER,
  password: env.DB_PASSWORD, database: env.DB_NAME,
  waitForConnections: true, connectionLimit: 10, queueLimit: 0,
  timezone: 'Z', decimalNumbers: false, supportBigNumbers: true,
  bigNumberStrings: true, dateStrings: true,
  ssl: env.DB_SSL_CA_PATH ? { ca: fs.readFileSync(env.DB_SSL_CA_PATH), rejectUnauthorized: true } : undefined
});
module.exports = pool;
