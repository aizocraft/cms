const { body } = require('express-validator');
const User = require('../models/User');

// Common validation rules
const usernameRule = body('username')
  .trim()
  .isLength({ min: 3, max: 30 })
  .withMessage('Username must be between 3-30 characters');

const emailRule = body('email')
  .trim()
  .isEmail()
  .withMessage('Please enter a valid email')
  .normalizeEmail()
  .custom(async (value, { req }) => {
    const user = await User.findOne({ email: value.toLowerCase() });
    if (user && user._id.toString() !== req.params?.id) {
      throw new Error('Email already in use');
    }
    return true;
  });

const passwordRule = body('password')
  .optional()
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long');

const roleRule = body('role')
  .isIn(['admin', 'engineer', 'finance'])
  .withMessage('Invalid role specified');

// Validation rules for creating a user
exports.createUserValidation = [
  usernameRule,
  emailRule,
  passwordRule.notEmpty().withMessage('Password is required'),
  roleRule
];

// Validation rules for updating a user
exports.updateUserValidation = [
  usernameRule.optional(),
  emailRule.optional(),
  passwordRule,
  roleRule.optional()
];