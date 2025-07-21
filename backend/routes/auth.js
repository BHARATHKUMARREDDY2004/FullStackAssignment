const express = require('express');
const router = express.Router();
const AuthService = require('../services/authService');
const { validate, loginSchema } = require('../middleware/validator');
const { authenticate } = require('../middleware/auth');

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const result = await AuthService.logout(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;