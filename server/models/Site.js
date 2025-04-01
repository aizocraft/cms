const mongoose = require('mongoose');

const SiteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a site name'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  expectedEndDate: Date,
  actualEndDate: Date,
  status: {
    type: String,
    enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  budget: Number,
  spent: {
    type: Number,
    default: 0
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  engineers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  description: String,
  client: {
    name: String,
    contact: String,
    email: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Site', SiteSchema);