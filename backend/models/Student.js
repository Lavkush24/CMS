const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  standard: String,
  aadharNumber: String,
  phone: String,

  joinedCoachingAt: {
    type: Date,
    default: Date.now
  },

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);