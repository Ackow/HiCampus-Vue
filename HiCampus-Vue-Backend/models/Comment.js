const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: true
    },
    commenter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
}, {
    timestamps: true // 这会自动添加 createdAt 和 updatedAt 字段
});

// 创建索引以提高查询性能
commentSchema.index({ article: 1, createdAt: -1 });
commentSchema.index({ commenter: 1 });
commentSchema.index({ parentComment: 1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment; 