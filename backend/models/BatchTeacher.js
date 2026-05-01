const mongoose = require('mongoose');

const batchTeacherSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch'
  },

  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

});

module.exports = mongoose.model('BatchTeacher', batchTeacherSchema);