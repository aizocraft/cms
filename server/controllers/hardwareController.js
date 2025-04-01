const Hardware = require('../models/Hardware');

// @desc    Create hardware item
// @route   POST /api/v1/hardware
// @access  Private
exports.createHardware = async (req, res) => {
  try {
    // Normalize unit to lowercase
    if (req.body.unit) {
      req.body.unit = req.body.unit.toLowerCase();
    }

    const hardware = await Hardware.create({
      ...req.body,
      registeredBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: hardware,
      alert: hardware.checkStock() ? 'Low stock!' : null,
      validUnits: ['kg', 'tonnes', 'pieces', 'liters', 'bags', 'rolls', 'units']
    });

  } catch (err) {
    console.error('Hardware Error:', err);
    
    let statusCode = 500;
    let message = 'Server error';
    
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = Object.values(err.errors)
        .map(val => val.message)
        .join(', ');
    } else if (err.code === 11000) {
      statusCode = 409;
      message = 'Item already exists';
    }

    res.status(statusCode).json({
      success: false,
      message,
      validUnits: ['kg', 'tonnes', 'pieces', 'liters', 'bags', 'rolls', 'units']
    });
  }
};

// @desc    Get all hardware items
// @route   GET /api/v1/hardware
// @access  Private
exports.getHardware = async (req, res) => {
  try {
    const hardware = await Hardware.find()
      .populate('registeredBy', 'username email')
      .sort('-createdAt')
      .lean();

    const enhancedData = hardware.map(item => ({
      ...item,
      needsRestock: item.quantity < item.threshold,
      // Add auto-conversion for kg to tonnes
      ...(item.unit === 'kg' && item.quantity >= 1000 ? {
        converted: {
          quantity: (item.quantity / 1000).toFixed(2),
          unit: 'tonnes'
        }
      } : {})
    }));

    res.status(200).json({
      success: true,
      count: hardware.length,
      data: enhancedData
    });

  } catch (err) {
    console.error('Get Hardware Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Update hardware item
// @route   PUT /api/v1/hardware/:id
// @access  Private
exports.updateHardware = async (req, res) => {
  try {
    // Normalize unit if provided
    if (req.body.unit) {
      req.body.unit = req.body.unit.toLowerCase();
    }

    const hardware = await Hardware.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        lastRestocked: req.body.quantity ? Date.now() : undefined
      },
      { 
        new: true,
        runValidators: true,
        context: 'query'
      }
    ).populate('registeredBy', 'username');

    if (!hardware) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: hardware,
      alert: hardware.checkStock() ? 'Low stock!' : null
    });

  } catch (err) {
    console.error('Update Error:', err);
    
    let statusCode = 500;
    let message = 'Update failed';
    
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = Object.values(err.errors)
        .map(val => val.message)
        .join(', ');
    }

    res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
  }
};
// @desc    Delete hardware item
// @route   DELETE /api/v1/hardware/:id
// @access  Private (Admin & Engineer)
exports.deleteHardware = async (req, res) => {
  try {
    // Ensure only Admin or Engineer can delete
    if (req.user.role !== 'admin' && req.user.role !== 'engineer') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete hardware'
      });
    }

    const hardware = await Hardware.findByIdAndDelete(req.params.id);

    if (!hardware) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hardware item deleted'
    });

  } catch (err) {
    console.error('Delete Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete item'
    });
  }
};
