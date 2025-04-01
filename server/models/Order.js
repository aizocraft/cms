const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  hardwareItems: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hardware',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: true
    }
  }],
  supplier: {
    type: String,
    required: true,
    trim: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  expectedDelivery: Date,
  status: {
    type: String,
    enum: ['pending', 'approved', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partially_paid', 'paid'],
    default: 'unpaid'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: String
}, { timestamps: true });

// Calculate total before saving
OrderSchema.pre('save', function(next) {
  if (this.isModified('hardwareItems')) {
    this.totalAmount = this.hardwareItems.reduce(
      (total, item) => total + (item.quantity * item.unitPrice), 
      0
    );
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);