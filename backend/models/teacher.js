const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    user :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    teacherId : {
        type : String,
        required : true,
        unique : true
    },
    fullName : {
        type : String,
        required : true
    },
    subject:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Subject',
        
    },
    classes:[{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Class'
    }],
     photo:{
        type : String
    },

    phone : {
        type : String
    },
    qualification : {
        type : String
    }
}, {timestamps : true});

module.exports = mongoose.model('Teacher', teacherSchema);