const mongoose = require('mongoose');

const subjectSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    code:{
        type: String,
    }


}, {timestamps : true});

module.exports =  mongoose.model('Subject', subjectSchema);