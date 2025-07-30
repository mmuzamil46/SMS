const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
   photo: {
    type: String 
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  address: {
    type: String
  },
  parentName: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
 
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
