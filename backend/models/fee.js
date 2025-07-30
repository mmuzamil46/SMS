const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    student : {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Student',
        required : true
    },
    amount : {
        type : Number,
        required : true
    },
    status : {
        type : String,
        enum : ['paid', 'unpaid'],
        default : 'unpaid',
        required : true
    },
    dueDate : Date,
    paidDate : Date,
    paymentMethod : {
        type : String,
        enum : ['cash', 'online', 'cheque'],
        default : 'cash'
    }
}, {timestamps : true});

module.exports = mongoose.model('Fee', feeSchema);