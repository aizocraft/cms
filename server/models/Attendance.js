const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: [true, 'Worker ID is required']
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  present: {
    type: Boolean,
    default: true
  },
  site: {
    type: String,
    required: [true, 'Site location is required'],
    trim: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);