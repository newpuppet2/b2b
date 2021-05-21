const mongoose = require('mongoose');

const replySchema = mongoose.Schema({
    commentid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
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
    }]

})

exports.Reply = mongoose.model('Reply', replySchema);