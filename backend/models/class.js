const mongoose = require('mongoose');
const classSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 50
  },
  section: {
    type: String,
    required: true,
    uppercase: true
    
  },
  homeRoomTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  capacity: {
    type: Number,
    default: 30,
    min: 10,
    max: 50
  },
  prevHomeRoomTeacher: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });



// const classSchema = mongoose.Schema({
//     name :{
//         type : String,
//         required : true
//     },
//     section : {
//         type : String,
//         required : true
//     },
//     homeRoomTeacher : {
//         type : mongoose.Schema.Types.ObjectId,
//         ref : 'Teacher'
//     }
    
// }, {timestamps : true});

 module.exports = mongoose.model('Class', classSchema);