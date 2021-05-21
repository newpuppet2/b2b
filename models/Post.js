const mongoose = require('mongoose');
const {User} = require('./user');

const postSchema = mongoose.Schema({
    image: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        required: true
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    like: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    nooflike: {
        type: Number,
        default:0
    },
    dislike: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comment1: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    noofcom: {
        type: Number,
        default:0
    },
    noofview: {
        type: Number,
        default:0
    }


})

exports.Post = mongoose.model('Post', postSchema);