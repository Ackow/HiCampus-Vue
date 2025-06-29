const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255
    },
    content: {
        type: String,
        required: true
    },
    video: {
        url: String,
        thumbnail: String,
        duration: Number
    },
    location: {
        name: {
            type: String,
            trim: true
        },
        address: {
            type: String,
            trim: true
        },
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    likeCount: {
        type: Number,
        default: 0
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    commentCount: {
        type: Number,
        default: 0
    },
    collectCount: {
        type: Number,
        default: 0
    },
    collectedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    mentionedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    adminMentions: [{
        type: String,
        trim: true
    }],
    topics: [{
        type: String,
        trim: true,
        maxlength: 50
    }]
}, {
    timestamps: true // 这会自动添加 createdAt 和 updatedAt 字段
});

// 创建索引以提高查询性能
articleSchema.index({ creator: 1, createdAt: -1 });
articleSchema.index({ title: 'text', content: 'text' }); // 用于全文搜索
articleSchema.index({ topics: 1 }); // 为话题添加索引
articleSchema.index({ mentionedUsers: 1 }); // 为被艾特用户添加索引
articleSchema.index({ collectedBy: 1 }); // 为收藏用户添加索引
articleSchema.index({ likedBy: 1 }); // 为点赞用户添加索引
articleSchema.index({ adminMentions: 1 });

const Article = mongoose.model('Article', articleSchema);

module.exports = Article; 