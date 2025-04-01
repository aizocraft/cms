const { check } = require('express-validator');

exports.registerValidation = [
  check('username', 'Username is required').not().isEmpty(),
  check('username', 'Username must be between 3 and 30 characters').isLength({ min: 3, max: 30 }),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  check('role', 'Role must be admin, engineer, or finance').optional().isIn(['admin', 'engineer', 'finance' ]),
];

exports.loginValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
];