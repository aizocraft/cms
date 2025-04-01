const express = require('express');
const router = express.Router();
const {
  registerWorker,
  getWorkers,
  getWorker,
  updateWorker,
  deleteWorker
} = require('../controllers/workerController');
const { workerValidation } = require('../validations/workerValidation');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// POST /api/v1/workers
router.post('/', workerValidation, registerWorker);

// GET /api/v1/workers
router.get('/', getWorkers);

// GET /api/v1/workers/:id
router.get('/:id', getWorker);

// PUT /api/v1/workers/:id
router.put('/:id', workerValidation, updateWorker);

// DELETE /api/v1/workers/:id
router.delete('/:id', deleteWorker);

module.exports = router;