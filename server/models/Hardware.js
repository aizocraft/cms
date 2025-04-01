const mongoose = require('mongoose');

const HardwareSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 chars']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Construction',
      'Electrical',
      'Plumbing',
      'Tools',
      'Safety',
      'Other'
    ]
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'pieces', 'liters', 'bags', 'tonnes', 'rolls', 'units']
  },
  pricePerUnit: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  supplier: {
    type: String,
    required: [true, 'Supplier is required'],
    trim: true
  },
  threshold: {
    type: Number,
    default: 10,
    min: [0, 'Threshold cannot be negative']
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Alert when stock is low
HardwareSchema.methods.checkStock = function() {
  return this.quantity < this.threshold;
};

module.exports = mongoose.model('Hardware', HardwareSchema);