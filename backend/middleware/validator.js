
const validate = (schema) => (req, res, next) => {
  const { errors, valid } = schema(req.body);
  if (!valid) {
    return res.status(400).json({ errors });
  }
  next();
};


const userSchema = (body) => {
  const errors = [];
  if (!body.name || typeof body.name !== 'string' || body.name.length > 100) {
    errors.push('Name is required and must be a string with max 100 characters.');
  }
  if (
    !body.email ||
    typeof body.email !== 'string' ||
    !body.email.includes('@')
  ) {
    errors.push('A valid email is required.');
  }
  if (!body.password || typeof body.password !== 'string' || body.password.length < 8) {
    errors.push('Password is required and must be at least 8 characters.');
  }
  return { valid: errors.length === 0, errors };
};

const userUpdateSchema = (body) => {
  const errors = [];
  if (body.name !== undefined && (typeof body.name !== 'string' || body.name.length > 100)) {
    errors.push('Name must be a string with max 100 characters.');
  }
  if (body.email !== undefined && 
      (typeof body.email !== 'string' || !body.email.includes('@'))) {
    errors.push('Email must be a valid email address.');
  }
  if (body.password !== undefined && 
      (typeof body.password !== 'string' || body.password.length < 8)) {
    errors.push('Password must be at least 8 characters.');
  }
  return { valid: errors.length === 0, errors };
};

const loginSchema = (body) => {
  const errors = [];
  if (
    !body.email ||
    typeof body.email !== 'string' ||
    !body.email.includes('@')
  ) {
    errors.push('A valid email is required.');
  }
  if (!body.password || typeof body.password !== 'string' || body.password.length < 8) {
    errors.push('Password is required and must be at least 8 characters.');
  }
  return { valid: errors.length === 0, errors };
};

const taskSchema = (body) => {
  const errors = [];
  if (!body.title || typeof body.title !== 'string' || body.title.length > 100) {
    errors('Title is required and must be a string with max 100 characters.');
  }
  if (body.description && (typeof body.description !== 'string' || body.description.length > 500)) {
    errors.push('Description must be a string with max 500 characters.');
  }
  if (!['low', 'medium', 'high'].includes(body.priority)) {
    errors.push('Priority is required and must be one of: low, medium, high.');
  }
  if (
    body.due_date !== undefined &&
    body.due_date !== null &&
    isNaN(Date.parse(body.due_date))
  ) {
    errors.push('Due date must be a valid date or null.');
  }
  return { valid: errors.length === 0, errors };
};

const taskUpdateSchema = (body) => {
  const errors = [];
  if (body.title !== undefined && (typeof body.title !== 'string' || body.title.length > 100)) {
    errors.push('Title must be a string with max 100 characters.');
  }
  if (body.description !== undefined && 
      (typeof body.description !== 'string' || body.description.length > 500)) {
    errors.push('Description must be a string with max 500 characters.');
  }
  if (body.priority !== undefined && !['low', 'medium', 'high'].includes(body.priority)) {
    errors.push('Priority must be one of: low, medium, high.');
  }
  if (body.due_date !== undefined && 
      body.due_date !== null && 
      isNaN(Date.parse(body.due_date))) {
    errors.push('Due date must be a valid date or null.');
  }
  if (body.is_completed !== undefined && typeof body.is_completed !== 'boolean') {
    errors.push('Completion status must be a boolean value.');
  }
  return { valid: errors.length === 0, errors };
};

module.exports = { validate, userSchema, userUpdateSchema, loginSchema, taskSchema, taskUpdateSchema };