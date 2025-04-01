const { check } = require('express-validator');

exports.workerValidation = [
  check('name', 'Name is required')
    .not().isEmpty()
    .trim()
    .escape()
    .isLength({ max: 50 }),
    
  check('contact', 'Valid contact is required')
    .not().isEmpty()
    .trim()
    .isMobilePhone(),
    
  check('role', 'Role is required')
    .not().isEmpty()
    .trim()
    .escape(),
    
  check('dailyWage', 'Valid daily wage is required')
    .isFloat({ min: 0 })
];