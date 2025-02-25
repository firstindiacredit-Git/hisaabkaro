const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  template: {
    type: String,
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue'],
    default: 'draft'
  },
  items: [{
    description: String,
    quantity: Number,
    price: Number,
    total: Number
  }],
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  billingDetails: {
    from: {
      companyName: String,
      address: String,
      phone: String,
      email: String,
      logo: String
    },
    to: {
      name: String,
      address: String,
      phone: String,
      email: String
    }
  },
  sentAt: Date,
  paidAt: Date,
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  recipientUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Invoice', invoiceSchema); 