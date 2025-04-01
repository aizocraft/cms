const { check } = require('express-validator');

const validCategories = [
  'Construction',
  'Electrical', 
  'Plumbing',
  'Tools',
  'Safety',
  'Other'
];

const validUnits = [
  'kg',
  'tonnes',
  'pieces', 
  'liters',
  'bags',
  'rolls',
  'units'
];

exports.hardwareValidation = [
  check('name', 'Name is required (3-100 characters)')
    .trim()
    .isLength({ min: 3, max: 100 }),
    
  check('category', `Valid category required: ${validCategories.join(', ')}`)
    .isIn(validCategories),
    
  check('quantity', 'Valid quantity (≥0) required')
    .isFloat({ min: 0 }),
    
  check('unit', `Valid unit required: ${validUnits.join(', ')}`)
    .isIn(validUnits)
    .toLowerCase(),
    
  check('pricePerUnit', 'Valid price (≥0) required')
    .isFloat({ min: 0 }),
    
  check('supplier', 'Supplier name required (2-100 characters)')
    .trim()
    .isLength({ min: 2, max: 100 }),
    
  check('threshold', 'Threshold must be ≥0')
    .optional()
    .isFloat({ min: 0 })
];