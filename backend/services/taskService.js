const Task = require('../models/task');
const logger = require('../config/logger');

class TaskService {
  static async createTask(data, user_id) {
    try {
      const taskData = { ...data, user_id };
      
      if (taskData.due_date) {
        const date = new Date(taskData.due_date);
        if (!isNaN(date.getTime())) {
          taskData.due_date = date.toISOString().split('T')[0];
        } else {
          taskData.due_date = null;
        }
      }
      
      const id = await Task.create(taskData);
      logger.info(`Task created: ${id} for user: ${user_id}`);
      return { id, ...taskData };
    } catch (error) {
      logger.error('Error creating task:', error);
      throw error;
    }
  }

  static async getTasks(user_id, includeCompleted = true) {
    const tasks = await Task.findByUserId(user_id, includeCompleted);
    return tasks;
  }

  static async updateTask(id, user_id, updates) {
    if (updates.due_date) {
      const date = new Date(updates.due_date);
      if (!isNaN(date.getTime())) {
        updates.due_date = date.toISOString().split('T')[0];
      } else {
        updates.due_date = null;
      }
    }
    
    const result = await Task.update(id, user_id, updates);
    if (!result) {
      throw new Error('Task not found or no valid updates provided');
    }
    logger.info(`Task updated: ${id}`);
    return result;
  }

  static async deleteTask(id, user_id) {
    const result = await Task.delete(id, user_id);
    if (!result) {
      throw new Error('Task not found');
    }
    logger.info(`Task deleted: ${id}`);
    return result;
  }
}

module.exports = TaskService;