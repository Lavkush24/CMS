const mongoose = require('mongoose');

const studentBatchSchema = new mongoose.Schema({

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },

  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },

  fees: {
    type: Number,
    default: 0
  },

  // NEW
  billingType: {
    type: String,
    enum: [
      'FULL_MONTH',
      'PRORATED'
    ],
    default: 'FULL_MONTH'
  },

  status: {
    type: String,
    enum: ['ACTIVE', 'LEFT'],
    default: 'ACTIVE'
  },

  joinedAt: {
    type: Date,
    default: Date.now
  },

  leftAt: Date,

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }

}, {
  timestamps: true
});

module.exports = mongoose.model(
  'StudentBatch',
  studentBatchSchema
);