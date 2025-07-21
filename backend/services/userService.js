const User = require('../models/user');
const logger = require('../config/logger');

class UserService {
  static async createUser(data) {
    try {
      const id = await User.create(data);
      logger.info(`User created: ${data.email}`);
      return { id, ...data };
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  static async getAllUsers() {
    try {
      const users = await User.findAll();
      logger.info('Retrieved all users');
      return users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    } catch (error) {
      logger.error('Error fetching users:', error);
      throw error;
    }
  }

  static async getUserById(id) {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new Error('User not found');
      }

      const { password, ...userWithoutPassword } = user;
      logger.info(`Retrieved user: ${id}`);
      return userWithoutPassword;
    } catch (error) {
      logger.error('Error fetching user:', error);
      throw error;
    }
  }

  static async updateUser(id, updates) {
    const result = await User.update(id, updates);
    if (!result) {
      throw new Error('User not found or no valid updates provided');
    }
    logger.info(`User updated: ${id}`);
    return result;
  }

  static async deleteUser(id) {
    const result = await User.softDelete(id);
    if (!result) {
      throw new Error('User not found');
    }
    logger.info(`User soft deleted: ${id}`);
    return result;
  }
}

module.exports = UserService;