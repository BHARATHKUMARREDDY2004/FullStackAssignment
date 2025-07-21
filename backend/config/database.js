const mysql = require('mysql2/promise');
const fs = require('fs');
const config = require('./config');

const ssl =
  config.db.sslCA && fs.existsSync(config.db.sslCA)
    ? {
        ssl: {
          ca: fs.readFileSync(config.db.sslCA)
        }
      }
    : {};

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ...ssl
});

module.exports = pool;
