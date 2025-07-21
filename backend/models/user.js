const QueryExecutor = require('../utils/queryExecutor');
const bcrypt = require('bcryptjs');

class User {
  static async create({ name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const data = {
      name,
      email,
      password: hashedPassword,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };
    return QueryExecutor.create('users', data);
  }

  static async findAll() {
    return QueryExecutor.findAll('users');
  }

  static async findByEmail(email) {
    return QueryExecutor.findOne('users', { email, is_active: true });
  }

  static async findById(id) {
    return QueryExecutor.findOne('users', { id, is_active: true });
  }

  static async update(id, updates) {
    const allowedUpdates = ['name', 'email', 'password'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce(async (objPromise, key) => {
        const obj = await objPromise;
        if (key === 'password') {
          obj[key] = await bcrypt.hash(updates[key], 10);
        } else {
          obj[key] = updates[key];
        }
        return obj;
      }, Promise.resolve({}));

    const finalUpdates = await filteredUpdates;
    if (Object.keys(finalUpdates).length === 0) return 0;
    
    finalUpdates.updated_at = new Date();
    return QueryExecutor.update('users', finalUpdates, { id });
  }

  static async softDelete(id) {
    return QueryExecutor.update('users', { is_active: false, updated_at: new Date() }, { id });
  }
}

module.exports = User;