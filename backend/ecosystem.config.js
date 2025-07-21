require('dotenv').config();

module.exports = {
  apps: [{
    name: 'task-manager',
    script: './app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD,
      DB_NAME: process.env.DB_NAME,
      DB_SSL_CA_PATH: process.env.DB_SSL_CA_PATH,
      JWT_SECRET: process.env.JWT_SECRET,
      PORT: process.env.PORT,
    },
    env_development: {
      NODE_ENV: 'development'
    }
  }]
};