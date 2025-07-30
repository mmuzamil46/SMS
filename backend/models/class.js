const mongoose = require('mongoose');

const classSchema = mongoose.Schema({
    name :{
        type : String,
        required : true
    },
    section : {
        type : String,
        required : true
    },
    homeRoomTeacher : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Teacher'
    }
    
}, {timestamps : true});

module.exports = mongoose.model('Class', classSchema);