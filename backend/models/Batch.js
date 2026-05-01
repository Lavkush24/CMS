const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: String,
  fees: Number,
  standard: String,
  subject: String,
  startDate: Date,
  batchTiming: String,


  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);