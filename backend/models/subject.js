const mongoose = require('mongoose');

const subjectSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
  gradeRange:{
    type : [Number],
    required : true
  },
  stream:{
    type : String,
    enum : ['natural', 'social', 'general'], default: 'general'
  }



}, {timestamps : true});

module.exports =  mongoose.model('Subject', subjectSchema);