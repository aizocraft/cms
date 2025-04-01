const User = require('../models/User');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// Error response handler
const errorResponse = (res, status, message, errors = []) => {
  return res.status(status).json({
    success: false,
    message,
    errors: errors.length ? errors : undefined
  });
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Unauthorized access');
    }

    const users = await User.find().select('-password');
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    console.error('Get all users error:', err);
    errorResponse(res, 500, 'Server error');
  }
};

// Get single user by ID (admin only)
exports.getUserById = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Unauthorized access');
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error('Get user by ID error:', err);
    errorResponse(res, 500, 'Server error');
  }
};

// Create new user (admin only)
exports.createUser = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Unauthorized access');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation failed', errors.array());
    }

    const { username, email, password, role } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return errorResponse(res, 400, 'User already exists');
    }

    // Create user (password will be hashed by pre-save hook)
    const user = new User({
      username,
      email: normalizedEmail,
      password,
      role
    });

    await user.save();

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Create user error:', err);
    errorResponse(res, 500, 'User creation failed');
  }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Unauthorized access');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation failed', errors.array());
    }

    const { username, email, role } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email is being changed to an existing one
    if (email) {
      const existingUser = await User.findOne({ 
        email: normalizedEmail,
        _id: { $ne: req.params.id }
      });
      if (existingUser) {
        return errorResponse(res, 400, 'Email already in use by another user');
      }
    }

    const updateFields = {
      username,
      email: normalizedEmail,
      role
    };

    // If password is provided, hash it
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(req.body.password, salt);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error('Update user error:', err);
    errorResponse(res, 500, 'User update failed');
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Unauthorized access');
    }

    // Prevent admin from deleting themselves
    if (req.user.id === req.params.id) {
      return errorResponse(res, 400, 'Cannot delete your own account');
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (err) {
    console.error('Delete user error:', err);
    errorResponse(res, 500, 'User deletion failed');
  }
};