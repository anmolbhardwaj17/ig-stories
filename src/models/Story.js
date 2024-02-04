const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');

const StorySchema = new Schema({
    id: {
        type: String,
        default: function genUUID() {
            return uuidv4()
        },
        unique: true
    },
    userId: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['normal', 'close'],
        default: 'normal'
    },
    date: {
        type: Date,
        default: Date.now
    },
    isExpired: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

StorySchema.methods.checkAndUpdateExpiration = async function () {
    const currentTime = new Date();
    if (currentTime - this.date >= 24 * 60 * 60 * 1000 && !this.isExpired) {
        this.isExpired = true;
        await this.save();
    }
};

module.exports = Story = mongoose.model('story', StorySchema);
