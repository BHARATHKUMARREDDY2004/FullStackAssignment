const express = require('express');
const router = express.Router();
const TaskService = require('../services/taskService');
const { authenticate } = require('../middleware/auth');
const { validate, taskSchema, taskUpdateSchema } = require('../middleware/validator');

router.post('/', authenticate, validate(taskSchema), async (req, res, next) => {
  try {
    const task = await TaskService.createTask(req.body, req.user.id);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const includeCompleted = req.query.includeCompleted !== 'false';
    
    const tasks = await TaskService.getTasks(req.user.id, includeCompleted);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, validate(taskUpdateSchema), async (req, res, next) => {
  try {
    const result = await TaskService.updateTask(req.params.id, req.user.id, req.body);
    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await TaskService.deleteTask(req.params.id, req.user.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;