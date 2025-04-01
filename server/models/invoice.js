// models/Invoice.js
const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  site: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    required: true
  },
  client: {
    name: String,
    address: String,
    contact: String,
    email: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    unit: String,
    total: Number
  }],
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    rate: Number,
    amount: Number
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  paymentTerms: String,
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  payments: [{
    date: Date,
    amount: Number,
    method: {
      type: String,
      enum: ['cash', 'check', 'credit_card', 'bank_transfer', 'other']
    },
    reference: String,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  balanceDue: {
    type: Number,
    default: function() { return this.total; }
  }
}, { timestamps: true });

// Pre-save hook to generate invoice number
InvoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${(count + 1).toString().padStart(5, '0')}`;
  }
  next();
});

// Update balance due when payments are made
InvoiceSchema.methods.addPayment = async function(payment) {
  this.payments.push(payment);
  this.balanceDue = this.total - this.payments.reduce((sum, p) => sum + p.amount, 0);
  
  if (this.balanceDue <= 0) {
    this.status = 'paid';
  } else if (new Date() > this.dueDate) {
    this.status = 'overdue';
  } else {
    this.status = 'sent';
  }
  
  await this.save();
};

module.exports = mongoose.model('Invoice', InvoiceSchema);