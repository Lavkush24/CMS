const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  standard: String,
  aadharNumber: String,
  phone: String,

  status: {
    type: String,
    enum: ['ACTIVE', 'LEFT'],
    default: 'ACTIVE'
  },

  leaveDate: Date,

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);