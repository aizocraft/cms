const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const auth = require('../middleware/auth');
const { check } = require('express-validator');

// GET /api/v1/orders
// POST /api/v1/orders
router.route('/')
  .get(auth, getOrders)
  .post(auth, [
    check('hardwareItems', 'At least one item is required').isArray({ min: 1 }),
    check('supplier', 'Supplier is required').not().isEmpty()
  ], createOrder);

// PUT /api/v1/orders/:id/status
router.route('/:id/status')
  .put(auth, [
    check('status', 'Valid status is required').isIn([
      'pending', 'approved', 'shipped', 'delivered', 'cancelled'
    ])
  ], updateOrderStatus);

module.exports = router;