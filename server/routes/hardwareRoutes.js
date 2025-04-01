const express = require('express');
const router = express.Router();
const {
  createHardware,
  getHardware,
  updateHardware,
  deleteHardware
} = require('../controllers/hardwareController');
const { hardwareValidation } = require('../validations/hardwareValidation');
const auth = require('../middleware/auth');

router.route('/')
  .post(auth, hardwareValidation, createHardware)
  .get(auth, getHardware);

router.route('/:id')
  .put(auth, hardwareValidation, updateHardware)
  .delete(auth, deleteHardware); 

module.exports = router;
