const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const User = require('../models/user');
const logger = require('../config/logger');

class AuthService {
  static async login(email, password) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });

    logger.info(`User logged in: ${email}`);
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  }

  static async logout(userId) {
    try {
      logger.info(`User logged out: ${userId}`);
      return { message: 'Logged out successfully' };
    } catch (error) {
      logger.error('Error during logout:', error);
      throw error;
    }
  }
}

module.exports = AuthService;