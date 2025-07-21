require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cluster = require('cluster');
const os = require('os');
const config = require('./config/config');
const logger = require('./config/logger');
const limiter = require('./middleware/rateLimiter');
const errorHandler = require('./utils/errorHandler');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');

const numCPUs = os.cpus().length;

if (cluster.isPrimary && process.env.NODE_ENV === 'production') {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    logger.info(`Worker ${worker.process.pid} died, forking new one.`);
    cluster.fork();
  });
} else {
  const app = express();

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    hsts: false
  }));

  const allowedOrigins = ['http://localhost:5500', 'http://127.0.0.1:5500'];
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Requested-With');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  });

  app.use(express.json());
  app.use(limiter);

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/tasks', taskRoutes);

  app.use(errorHandler);

  const PORT = config.port || 3000;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}, worker ${process.pid}`);
  });
}
