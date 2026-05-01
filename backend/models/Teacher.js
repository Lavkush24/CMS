const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: String,
  sharePercent: Number,
  subject: String,
  joinDate: Date,
  phone: String,
  aadharNumber: String,

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);