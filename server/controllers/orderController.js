const Order = require('../models/Order');
const Hardware = require('../models/Hardware');

exports.createOrder = async (req, res) => {
  try {
    const itemsWithPrices = await Promise.all(
      req.body.hardwareItems.map(async item => {
        const hardware = await Hardware.findById(item.item);
        if (!hardware) {
          throw new Error(`Hardware item ${item.item} not found`);
        }
        return {
          item: item.item,
          quantity: item.quantity,
          unitPrice: hardware.pricePerUnit
        };
      })
    );

    const order = await Order.create({
      ...req.body,
      hardwareItems: itemsWithPrices,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: order
    });

  } catch (err) {
    console.error('Order Error:', err);
    
    let statusCode = 500;
    let message = 'Server error';
    
    if (err.message.includes('not found')) {
      statusCode = 404;
      message = err.message;
    } else if (err.name === 'ValidationError') {
      statusCode = 400;
      message = Object.values(err.errors)
        .map(val => val.message)
        .join(', ');
    }

    res.status(statusCode).json({
      success: false,
      message
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('hardwareItems.item', 'name category unit')
      .populate('createdBy', 'username')
      .sort('-orderDate');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (err) {
    console.error('Get Orders Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (status === 'delivered') {
      await Promise.all(
        order.hardwareItems.map(async item => {
          await Hardware.findByIdAndUpdate(
            item.item,
            { $inc: { quantity: item.quantity } }
          );
        })
      );
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (err) {
    console.error('Update Order Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update order'
    });
  }
};