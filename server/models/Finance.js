const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  category: {
    type: String,
    enum: [
      'hardware_purchase', 
      'equipment', 
      'salaries', 
      'maintenance', 
      'other_expense',
      'client_payment',
      'other_income'
    ],
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'cheque', 'card', 'other'],
    required: true
  },
  description: String,
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referenceNo: String,
  attachments: [String] // URLs to stored files
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);