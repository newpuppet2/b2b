const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    postid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    text: {
        type: String,
        required: true,
    },
    like: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    dislike: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    reply1: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reply'
    }],
    noofrep: {
        type: Number,
        default:0
    }


})

exports.Comment = mongoose.model('Comment', commentSchema);