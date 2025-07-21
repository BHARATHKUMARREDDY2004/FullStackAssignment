const express = require('express');
const router = express.Router();
const UserService = require('../services/userService');
const { authenticate } = require('../middleware/auth');
const { validate, userSchema, userUpdateSchema } = require('../middleware/validator');

router.post('/', validate(userSchema), async (req, res, next) => {
  try {
    const user = await UserService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const users = await UserService.getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, validate(userUpdateSchema), async (req, res, next) => {
  try {
    const result = await UserService.updateUser(req.params.id, req.body);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await UserService.deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;