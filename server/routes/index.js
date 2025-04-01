const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./authRoutes');
const workerRoutes = require('./workerRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const hardwareRoutes = require('./hardwareRoutes');
const userRoutes = require('./userRoutes'); 
const orderRoutes = require('./orderRoutes');

// Mount routers
router.use('/auth', authRoutes);
router.use('/workers', workerRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/hardware', hardwareRoutes);
router.use('/users', userRoutes); 
router.use('/orders', orderRoutes);
module.exports = router;