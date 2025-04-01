const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// Improved error response handler
const errorResponse = (res, status, message, errors = []) => {
  return res.status(status).json({
    success: false,
    message,
    errors: errors.length ? errors : undefined
  });
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation failed', errors.array());
    }

    const { username, email, password, role = 'engineer' } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return errorResponse(res, 400, 'User already exists');
    }

    // Create and save user (hashing happens in pre-save hook)
    const user = new User({
      username,
      email: normalizedEmail,
      password, // Will be hashed by pre-save hook
      role
    });

    await user.save();

    // Create token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiration });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    errorResponse(res, 500, 'Registration failed');
  }
};

// Login user (with enhanced debugging)
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation failed', errors.array());
    }

    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Debug: Log login attempt
    console.log(`Login attempt for: ${normalizedEmail}`);

    // Find user with case-insensitive email
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      console.log('User not found:', normalizedEmail);
      return errorResponse(res, 400, 'Invalid credentials');
    }

    // Debug: Log user details
    console.log(`User found - ID: ${user._id}, Role: ${user.role}`);

    // Password comparison
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      // Special debug for admin roles
      if (['admin', 'administrator'].includes(user.role)) {
        console.log('Admin password mismatch!', {
          storedHashStart: user.password.substring(0, 10),
          inputLength: password.length
        });
      }
      return errorResponse(res, 400, 'Invalid credentials');
    }

    // Create token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiration });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    errorResponse(res, 500, 'Login failed');
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error('GetMe error:', err);
    errorResponse(res, 500, 'Server error');
  }
};