const QueryExecutor = require('../utils/queryExecutor');
const bcrypt = require('bcryptjs');

class Task {
  static async create({ title, description, priority, due_date, user_id }) {
    const data = {
      title,
      description,
      priority,
      due_date,
      user_id,
      created_at: new Date(),
      updated_at: new Date()
    };
    return QueryExecutor.create('tasks', data);
  }

  static async findByUserId(user_id, includeCompleted = true) {
    const conditions = { user_id };
    if (!includeCompleted) {
      conditions.is_completed = false;
    }
    return QueryExecutor.findAll('tasks', conditions);
  }

  static async findById(id, user_id) {
    return QueryExecutor.findOne('tasks', { id, user_id });
  }

  static async update(id, user_id, updates) {
    const allowedUpdates = ['title', 'description', 'priority', 'due_date', 'is_completed'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    if (Object.keys(filteredUpdates).length === 0) return 0;
    
    filteredUpdates.updated_at = new Date();
    return QueryExecutor.update('tasks', filteredUpdates, { id, user_id });
  }

  static async delete(id, user_id) {
    return QueryExecutor.delete('tasks', { id, user_id });
  }
}

module.exports = Task;