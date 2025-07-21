const pool = require('../config/database');
const logger = require('../config/logger');

class QueryExecutor {
  static async executeQuery(type, table, data = {}, conditions = {}) {
    try {
      let query;
      const params = [];
      
      switch (type) {
        case 'insert':
          const columns = Object.keys(data).join(', ');
          const values = Object.values(data);
          const placeholders = Array(values.length).fill('?').join(', ');
          query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
          params.push(...values);
          break;

        case 'select':
          const selectFields = data.fields || '*';
          let whereClause = '';
          if (Object.keys(conditions).length > 0) {
            whereClause = ' WHERE ' + Object.keys(conditions)
              .map(key => `${key} = ?`)
              .join(' AND ');
            params.push(...Object.values(conditions));
          }
          query = `SELECT ${selectFields} FROM ${table}${whereClause}`;
          break;

        case 'update':
          if (Object.keys(data).length === 0) {
            throw new Error('No data provided for update');
          }
          const setClause = Object.keys(data)
            .map(key => `${key} = ?`)
            .join(', ');
          let updateWhereClause = '';
          if (Object.keys(conditions).length > 0) {
            updateWhereClause = ' WHERE ' + Object.keys(conditions)
              .map(key => `${key} = ?`)
              .join(' AND ');
          }
          query = `UPDATE ${table} SET ${setClause}${updateWhereClause}`;
          params.push(...Object.values(data), ...Object.values(conditions));
          break;

        case 'delete':
          let deleteWhereClause = '';
          if (Object.keys(conditions).length > 0) {
            deleteWhereClause = ' WHERE ' + Object.keys(conditions)
              .map(key => `${key} = ?`)
              .join(' AND ');
          }
          query = `DELETE FROM ${table}${deleteWhereClause}`;
          params.push(...Object.values(conditions));
          break;

        default:
          throw new Error('Invalid query type');
      }

      const [result] = await pool.query(query, params);
      return result;
    } catch (error) {
      logger.error(`Database query error: ${error.message}`);
      throw error;
    }
  }

  static async findOne(table, conditions, fields = '*') {
    const result = await this.executeQuery('select', table, { fields }, conditions);
    return result[0] || null;
  }

  static async findAll(table, conditions = {}, fields = '*') {
    return this.executeQuery('select', table, { fields }, conditions);
  }

  static async create(table, data) {
    const result = await this.executeQuery('insert', table, data);
    return result.insertId;
  }

  static async update(table, data, conditions) {
    const result = await this.executeQuery('update', table, data, conditions);
    return result.affectedRows;
  }

  static async delete(table, conditions) {
    const result = await this.executeQuery('delete', table, {}, conditions);
    return result.affectedRows;
  }
}

module.exports = QueryExecutor;