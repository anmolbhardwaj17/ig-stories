const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');

const FriendSchema = new Schema({
    id: {
        type: String,
        default: function genUUID() {
            return uuidv4()
        },
        unique: true
    },
    friend1: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    friend2: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['requested', 'pending', 'friends'],
        default: 'pending'
    },
    date: {
        type: Date,
        default: Date.now
    },
    closeFriends: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

FriendSchema.index({ friend1: 1, friend2: 1 }, { unique: true });

module.exports = Friend = mongoose.model('friend', FriendSchema);
