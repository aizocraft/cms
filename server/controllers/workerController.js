const Worker = require('../models/Worker');
const { validationResult } = require('express-validator');

// @desc    Register a new worker
// @route   POST /api/v1/workers
// @access  Private
const registerWorker = async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  try {
    const { name, contact, role, dailyWage } = req.body;

    // Create worker
    const worker = await Worker.create({
      name,
      contact,
      role,
      dailyWage,
      registeredBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: worker
    });

  } catch (err) {
    console.error('Worker Registration Error:', err);
    
    // Handle duplicate contact
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Contact number already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to register worker'
    });
  }
};

// @desc    Get all workers
// @route   GET /api/v1/workers
// @access  Private
const getWorkers = async (req, res) => {
  try {
    const workers = await Worker.find()
      .select('-__v')
      .populate('registeredBy', 'username email')
      .lean();

    res.status(200).json({
      success: true,
      count: workers.length,
      data: workers || []
    });

  } catch (err) {
    console.error('Get Workers Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workers'
    });
  }
};

// @desc    Get single worker
// @route   GET /api/v1/workers/:id
// @access  Private
const getWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id)
      .select('-__v')
      .populate('registeredBy', 'username email');

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    res.status(200).json({
      success: true,
      data: worker
    });

  } catch (err) {
    console.error('Get Worker Error:', err);
    
    // Handle invalid ObjectId format
    if (err.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid worker ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch worker'
    });
  }
};

// @desc    Update worker
// @route   PUT /api/v1/workers/:id
// @access  Private
const updateWorker = async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  try {
    const { name, contact, role, dailyWage } = req.body;

    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      { name, contact, role, dailyWage },
      { new: true, runValidators: true }
    );

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    res.status(200).json({
      success: true,
      data: worker
    });

  } catch (err) {
    console.error('Update Worker Error:', err);
    
    // Handle duplicate contact
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Contact number already exists'
      });
    }

    // Handle invalid ObjectId format
    if (err.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid worker ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update worker'
    });
  }
};

// @desc    Delete worker
// @route   DELETE /api/v1/workers/:id
// @access  Private
const deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });

  } catch (err) {
    console.error('Delete Worker Error:', err);
    
    // Handle invalid ObjectId format
    if (err.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid worker ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete worker'
    });
  }
};

module.exports = {
  registerWorker,
  getWorkers,
  getWorker,
  updateWorker,
  deleteWorker
};