const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendance,
  getSingleAttendance,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendanceController');
const auth = require('../middleware/auth');

// Base route for collection operations
router.route('/')
  .post(auth, markAttendance)        // Create new attendance
  .get(auth, getAttendance);        // Get all attendance records

// Route for individual attendance operations
router.route('/:id')
  .get(auth, getSingleAttendance)    // Get single attendance
  .put(auth, updateAttendance)      // Update attendance
  .delete(auth, deleteAttendance);  // Delete attendance

module.exports = router;