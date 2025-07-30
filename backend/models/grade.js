const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  outOf:{
    type:Number,
    required: true
  },
  term: {
    type: String,
    required: true
  },
  examType: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Grade', gradeSchema);
