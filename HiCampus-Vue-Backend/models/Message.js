const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'collect', 'mention', 'follow'],
        required: true
    },
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: function() {
            return this.type !== 'follow';
        }
    },
    content: {
        type: String,
        default: ''
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', messageSchema); 