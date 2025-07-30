const mongoose = require('mongoose');

const announcementSchema = mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    message : {
        type : String,
        required : true
    },
      postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  targetAudience: {
    type: String,
    enum: ['All', 'Students', 'Teachers'],
    default: 'All'
  },
    date : {
        type : Date,
        default : Date.now
    }
}, {timestamps : true});

module.exports = mongoose.model('Announcement', announcementSchema);