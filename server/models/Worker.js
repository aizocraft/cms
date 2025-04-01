const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  contact: {
    type: String,
    required: [true, 'Please add contact information'],
    unique: true,
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Please specify the role'],
    trim: true
  },
  dailyWage: {
    type: Number,
    required: [true, 'Please add daily wage amount'],
    min: [0, 'Wage must be a positive number']
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Worker', WorkerSchema);