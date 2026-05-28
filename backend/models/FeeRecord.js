const mongoose = require('mongoose');

const feeRecordSchema = new mongoose.Schema({

  // Student who paid
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },

  // Batch for which payment was made
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },

  // Coaching owner
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Amount actually paid
  amountPaid: {
    type: Number,
    required: true,
    min: 0
  },

  // Monthly fee at payment time
  // store snapshot because batch fee may change later
  batchFees: {
    type: Number,
    required: true
  },

  // Which months this payment covers
  coveredMonths: [{
    type: String
  }],

  // Payment mode
  paymentMethod: {
    type: String,
    enum: ['CASH', 'UPI', 'BANK', 'CARD'],
    default: 'CASH'
  },

  // Optional transaction reference
  transactionId: {
    type: String,
    default: null
  },

  // Optional note
  note: {
    type: String,
    trim: true,
    default: ''
  },

  // Whether payment was partial
  isPartialPayment: {
    type: Boolean,
    default: false
  },

  // Payment date
  paidAt: {
    type: Date,
    default: Date.now
  },

  // Receipt number
  receiptNumber: {
    type: String,
    default: null
  }

}, {
  timestamps: true
});


// Useful indexes
feeRecordSchema.index({
  studentId: 1,
  batchId: 1
});

feeRecordSchema.index({
  ownerId: 1,
  paidAt: -1
});

module.exports = mongoose.model('FeeRecord', feeRecordSchema);