const path = require('path');

module.exports = {
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    sslCA: process.env.DB_SSL_CA_PATH
      ? path.resolve(__dirname, '..', process.env.DB_SSL_CA_PATH)
      : null
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '1h'
  },
  port: process.env.PORT
};
