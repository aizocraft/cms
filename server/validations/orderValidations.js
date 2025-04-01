const { check } = require('express-validator');

exports.orderValidation = [
  check('hardwareItems').isArray({ min: 1 }).withMessage('At least one item is required'),
  check('hardwareItems.*.item').isMongoId().withMessage('Invalid hardware item ID'),
  check('hardwareItems.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  check('supplier').not().isEmpty().withMessage('Supplier is required'),
  check('expectedDelivery').optional().isISO8601().withMessage('Invalid date format')
];