const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { createUserValidation, updateUserValidation } = require('../validations/userValidation');
const auth = require('../middleware/auth');

// @route   GET api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', auth, userController.getAllUsers);

// @route   GET api/users/:id
// @desc    Get user by ID (admin only)
// @access  Private/Admin
router.get('/:id', auth, userController.getUserById);

// @route   POST api/users
// @desc    Create new user (admin only)
// @access  Private/Admin
router.post('/', auth, createUserValidation, userController.createUser);

// @route   PUT api/users/:id
// @desc    Update user (admin only)
// @access  Private/Admin
router.put('/:id', auth, updateUserValidation, userController.updateUser);

// @route   DELETE api/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/:id', auth, userController.deleteUser);

module.exports = router;