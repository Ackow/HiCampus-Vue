const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Image = require('../models/Image');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Message = require('../models/Message');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const authenticateToken = require('../middleware/auth');

// 获取文章列表
const getArticles = async (req, res) => {
    try {
        console.log('开始获取文章列表');
        console.log('请求参数:', req.query);
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;

        console.log('分页参数:', { page, limit, skip });

        // 获取文章列表，按创建时间倒序排列
        const articles = await Article.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('creator', 'nickname avatar')
            .populate('mentionedUsers', 'nickname avatar');

        console.log('查询到的文章数量:', articles.length);

        // 获取每篇文章的图片
        const articlesWithImages = await Promise.all(articles.map(async (article) => {
            const images = await Image.find({ article: article._id });
            const articleObj = article.toObject();
            return {
                ...articleObj,
                images: images.map(img => img.imageUrl.split('/').pop()),
                creator: article.creator ? {
                    ...article.creator.toObject(),
                    avatar: article.creator.avatar ? article.creator.avatar.split('/').pop() : 'default-avatar.jpg'
                } : null,
                mentionedUsers: article.mentionedUsers ? article.mentionedUsers.map(user => ({
                    ...user.toObject(),
                    avatar: user.avatar ? user.avatar.split('/').pop() : 'default-avatar.jpg'
                })) : []
            };
        }));

        // 获取文章总数
        const total = await Article.countDocuments();
        console.log('文章总数:', total);

        res.json({
            articles: articlesWithImages,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalArticles: total
        });
    } catch (error) {
        console.error('获取文章列表失败:', error);
        res.status(500).json({ 
            message: '获取文章列表失败',
            error: error.message 
        });
    }
};

// 按话题获取文章
const getArticlesByTopic = async (req, res) => {
    try {
        const { topic } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;

        const articles = await Article.find({ topics: topic })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('creator', 'nickname avatar')
            .populate('mentionedUsers', 'nickname avatar');

        const articlesWithImages = await Promise.all(articles.map(async (article) => {
            const images = await Image.find({ article: article._id });
            return {
                ...article.toObject(),
                images: images.map(img => img.imageUrl.split('/').pop()),
                creator: {
                    ...article.creator.toObject(),
                    avatar: article.creator.avatar.split('/').pop()
                },
                mentionedUsers: article.mentionedUsers.map(user => ({
                    ...user.toObject(),
                    avatar: user.avatar.split('/').pop()
                }))
            };
        }));

        const total = await Article.countDocuments({ topics: topic });

        res.json({
            articles: articlesWithImages,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalArticles: total
        });
    } catch (error) {
        console.error('获取话题文章失败:', error);
        res.status(500).json({
            message: '获取话题文章失败',
            error: error.message
        });
    }
};

// 获取被艾特的文章
const getMentionedArticles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;

        const articles = await Article.find({ mentionedUsers: req.user.userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('creator', 'nickname avatar')
            .populate('mentionedUsers', 'nickname avatar');

        const articlesWithImages = await Promise.all(articles.map(async (article) => {
            const images = await Image.find({ article: article._id });
            return {
                ...article.toObject(),
                images: images.map(img => img.imageUrl.split('/').pop()),
                creator: {
                    ...article.creator.toObject(),
                    avatar: article.creator.avatar.split('/').pop()
                },
                mentionedUsers: article.mentionedUsers.map(user => ({
                    ...user.toObject(),
                    avatar: user.avatar.split('/').pop()
                }))
            };
        }));

        const total = await Article.countDocuments({ mentionedUsers: req.user.userId });

        res.json({
            articles: articlesWithImages,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalArticles: total
        });
    } catch (error) {
        console.error('获取被艾特文章失败:', error);
        res.status(500).json({
            message: '获取被艾特文章失败',
            error: error.message
        });
    }
};

// 创建文章
const createArticle = async (req, res) => {
    try {
        const { title, content, images, mentions, topics, location, adminMentions, video } = req.body;
        
        // 验证必要字段
        if (!title || !content) {
            return res.status(400).json({ 
                message: '标题和内容不能为空',
                error: 'Missing required fields'
            });
        }

        // 验证用户ID
        if (!req.user || !req.user.userId) {
            console.error('用户信息缺失:', req.user);
            return res.status(401).json({ 
                message: '用户未登录',
                error: 'Unauthorized'
            });
        }

        console.log('创建文章数据:', {
            creator: req.user.userId,
            title,
            content,
            imagesCount: images ? images.length : 0,
            mentionsCount: mentions ? mentions.length : 0,
            topicsCount: topics ? topics.length : 0,
            location: location || null,
            adminMentions: adminMentions || [],
            hasVideo: !!video
        });

        // 创建文章
        const article = new Article({
            creator: req.user.userId,
            title,
            content,
            likeCount: 0,
            commentCount: 0,
            mentionedUsers: mentions || [],
            topics: topics || [],
            location: location || null,
            adminMentions: adminMentions || [],
            video: video ? {
                url: video.url,
                thumbnail: video.thumbnail,
                duration: video.duration
            } : null
        });

        // 保存文章
        const savedArticle = await article.save();
        console.log('文章保存成功:', savedArticle._id);

        // 如果有图片，创建图片记录
        if (images && images.length > 0) {
            try {
                const imagePromises = images.map(image => {
                    const newImage = new Image({
                        article: savedArticle._id,
                        imageUrl: image.imageUrl
                    });
                    return newImage.save();
                });

                await Promise.all(imagePromises);
                console.log('图片记录保存成功');
            } catch (imageError) {
                console.error('图片记录保存失败:', imageError);
                // 即使图片保存失败，也返回文章创建成功
            }
        }

        // 处理管理员艾特消息
        if (adminMentions && adminMentions.length > 0) {
            try {
                let targetUsers = [];
                
                // 获取所有用户
                const allUsers = await User.find({}, '_id');
                
                // 处理艾特所有用户
                if (adminMentions.includes('all_users')) {
                    targetUsers = allUsers.map(user => user._id);
                } else {
                    // 处理艾特特定学院
                    const collegeMentions = adminMentions.filter(mention => mention.startsWith('college:'));
                    if (collegeMentions.length > 0) {
                        const colleges = collegeMentions.map(mention => mention.replace('college:', ''));
                        const collegeUsers = await User.find({ college: { $in: colleges } }, '_id');
                        targetUsers = collegeUsers.map(user => user._id);
                    }
                }

                // 创建消息通知
                if (targetUsers.length > 0) {
                    const messagePromises = targetUsers.map(receiverId => {
                        const message = new Message({
                            sender: req.user.userId,
                            receiver: receiverId,
                            type: 'mention',
                            article: savedArticle._id,
                        });
                        return message.save();
                    });

                    await Promise.all(messagePromises);
                    console.log('管理员艾特消息创建成功');
                }
            } catch (messageError) {
                console.error('管理员艾特消息创建失败:', messageError);
                // 即使消息创建失败，也返回文章创建成功
            }
        }

        // 处理普通用户艾特消息
        if (mentions && mentions.length > 0) {
            try {
                const messagePromises = mentions.map(receiverId => {
                    const message = new Message({
                        sender: req.user.userId,
                        receiver: receiverId,
                        type: 'mention',
                        article: savedArticle._id,
                        content: `有人在文章《${title}》中提到了你`
                    });
                    return message.save();
                });

                await Promise.all(messagePromises);
                console.log('普通用户艾特消息创建成功');
            } catch (messageError) {
                console.error('普通用户艾特消息创建失败:', messageError);
                // 即使消息创建失败，也返回文章创建成功
            }
        }

        res.status(201).json({
            message: '文章发布成功',
            article: savedArticle
        });
    } catch (error) {
        console.error('文章发布详细错误:', error);
        res.status(500).json({ 
            message: '文章发布失败',
            error: error.message
        });
    }
};

// 获取文章评论
const getArticleComments = async (req, res) => {
    try {
        const { articleId } = req.params;
        console.log('获取评论，文章ID:', articleId);

        // 验证文章是否存在
        const article = await Article.findById(articleId);
        if (!article) {
            console.log('文章不存在:', articleId);
            return res.status(404).json({ 
                message: '文章不存在',
                error: 'Article not found'
            });
        }

        // 获取主评论（非回复）
        const comments = await Comment.find({ 
            article: articleId,
            parentComment: null 
        })
        .sort({ createdAt: -1 })
        .populate('commenter', 'nickname avatar')
        .populate({
            path: 'replies',
            populate: [
                { path: 'commenter', select: 'nickname avatar' },
                { path: 'replyTo', select: 'nickname avatar' }
            ]
        });
        
        console.log('找到评论数量:', comments.length);

        res.json(comments);
    } catch (error) {
        console.error('获取评论失败:', error);
        res.status(500).json({ 
            message: '获取评论失败',
            error: error.message 
        });
    }
};

// 添加评论
const addComment = async (req, res) => {
    try {
        const { articleId } = req.params;
        const { content, parentCommentId, replyToId } = req.body;

        if (!content) {
            return res.status(400).json({ 
                message: '评论内容不能为空',
                error: 'Missing content'
            });
        }

        // 创建评论
        const comment = new Comment({
            article: articleId,
            commenter: req.user.userId,
            content,
            parentComment: parentCommentId || null,
            replyTo: replyToId || null
        });

        // 保存评论
        const savedComment = await comment.save();

        // 如果是回复，更新父评论的replies数组
        if (parentCommentId) {
            await Comment.findByIdAndUpdate(parentCommentId, {
                $push: { replies: savedComment._id }
            });
        }

        // 更新文章的评论数
        await Article.findByIdAndUpdate(articleId, {
            $inc: { commentCount: 1 }
        });

        // 获取文章信息
        const article = await Article.findById(articleId);
        
        // 创建消息记录
        let messageReceiver;
        if (parentCommentId) {
            // 如果是回复，通知被回复的用户
            messageReceiver = replyToId;
        } else {
            // 如果是新评论，通知文章作者
            messageReceiver = article.creator;
        }

        // 如果评论者不是接收者，创建消息
        if (req.user.userId.toString() !== messageReceiver.toString()) {
            const message = new Message({
                sender: req.user.userId,
                receiver: messageReceiver,
                type: 'comment',
                article: articleId,
                content: content
            });
            await message.save();
        }

        // 返回带有评论者信息的评论
        const populatedComment = await Comment.findById(savedComment._id)
            .populate('commenter', 'nickname avatar')
            .populate('replyTo', 'nickname avatar');

        res.status(201).json(populatedComment);
    } catch (error) {
        console.error('添加评论失败:', error);
        res.status(500).json({ 
            message: '添加评论失败',
            error: error.message 
        });
    }
};

// 删除评论
const deleteComment = async (req, res) => {
    try {
        const { articleId, commentId } = req.params;
        const userId = req.user.userId;

        // 查找评论（同时验证评论是否属于指定文章）
        const comment = await Comment.findOne({
            _id: commentId,
            article: articleId
        });

        if (!comment) {
            return res.status(404).json({ message: '评论不存在' });
        }

        // 获取当前用户信息
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }

        // 验证权限（评论作者、管理员或超级管理员可以删除）
        if (comment.commenter.toString() !== userId && !['admin', 'superadmin'].includes(user.role)) {
            return res.status(403).json({ message: '没有权限删除此评论' });
        }

        // 如果是主评论，删除所有回复
        if (!comment.parentComment) {
            await Comment.deleteMany({ parentComment: commentId });
        } else {
            // 如果是回复，从父评论的replies数组中移除
            await Comment.findByIdAndUpdate(comment.parentComment, {
                $pull: { replies: commentId }
            });
        }

        // 删除评论
        await Comment.findByIdAndDelete(commentId);

        // 更新文章的评论数
        await Article.findByIdAndUpdate(articleId, {
            $inc: { commentCount: -1 }
        });

        res.json({ message: '评论删除成功' });
    } catch (error) {
        console.error('删除评论失败:', error);
        res.status(500).json({ message: '删除评论失败' });
    }
};

// 获取用户发布的文章
const getUserArticles = async (req, res) => {
    try {
        console.log('开始获取用户文章，用户ID:', req.user.userId);
        
        // 验证用户ID
        if (!req.user || !req.user.userId) {
            console.error('用户未登录或用户ID不存在');
            return res.status(401).json({ message: '用户未登录' });
        }

        const articles = await Article.find({ creator: req.user.userId })
            .sort({ createdAt: -1 })
            .populate('creator', 'nickname avatar');

        console.log('找到文章数量:', articles.length);

        // 获取每篇文章的图片
        const articlesWithImages = await Promise.all(articles.map(async (article) => {
            try {
                const images = await Image.find({ article: article._id });
                const articleObj = article.toObject();
                
                return {
                    ...articleObj,
                    images: images.map(img => img.imageUrl.split('/').pop()),
                    creator: article.creator ? {
                        ...article.creator.toObject(),
                        avatar: article.creator.avatar ? article.creator.avatar.split('/').pop() : 'default-avatar.jpg'
                    } : null,
                    isLiked: articleObj.likedBy ? articleObj.likedBy.includes(req.user.userId) : false,
                    isCollected: articleObj.collectedBy ? articleObj.collectedBy.includes(req.user.userId) : false
                };
            } catch (error) {
                console.error('处理文章图片时出错:', error);
                return null;
            }
        }));

        // 过滤掉处理失败的文章
        const validArticles = articlesWithImages.filter(article => article !== null);
        console.log('成功处理文章数量:', validArticles.length);

        res.json({ articles: validArticles });
    } catch (err) {
        console.error('获取用户文章错误:', err);
        res.status(500).json({ 
            message: '服务器错误',
            error: err.message 
        });
    }
};

// 获取用户收藏的文章
const getUserFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate({
                path: 'favorites',
                populate: {
                    path: 'creator',
                    select: 'nickname avatar'
                }
            });

        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }

        // 获取每篇文章的图片
        const articlesWithImages = await Promise.all(user.favorites.map(async (article) => {
            const images = await Image.find({ article: article._id });
            return {
                ...article.toObject(),
                images: images.map(img => img.imageUrl.split('/').pop()),
                creator: article.creator ? {
                    ...article.creator.toObject(),
                    avatar: article.creator.avatar ? article.creator.avatar.split('/').pop() : 'default-avatar.jpg'
                } : null,
                isLiked: article.likedBy ? article.likedBy.includes(req.user.userId) : false,
                isCollected: true,
                collectCount: article.collectCount || 0
            };
        }));

        res.json({ articles: articlesWithImages });
    } catch (err) {
        console.error('获取用户收藏错误:', err);
        res.status(500).json({ message: '服务器错误' });
    }
};

// 获取用户点赞的文章
const getUserLikes = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate({
                path: 'likes',
                populate: {
                    path: 'creator',
                    select: 'nickname avatar'
                }
            });

        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }

        // 获取每篇文章的图片
        const articlesWithImages = await Promise.all(user.likes.map(async (article) => {
            const images = await Image.find({ article: article._id });
            return {
                ...article.toObject(),
                images: images.map(img => img.imageUrl.split('/').pop()),
                isLiked: true, // 从用户点赞列表获取的文章一定是已点赞的
                isCollected: article.collectedBy ? article.collectedBy.includes(req.user.userId) : false,
                creator: article.creator ? {
                    ...article.creator.toObject(),
                    avatar: article.creator.avatar ? article.creator.avatar.split('/').pop() : 'default-avatar.jpg'
                } : null
            };
        }));

        res.json({ articles: articlesWithImages });
    } catch (err) {
        console.error('获取用户点赞错误:', err);
        res.status(500).json({ message: '服务器错误' });
    }
};

// 点赞文章
const likeArticle = async (req, res) => {
    try {
        const { articleId } = req.params;
        const userId = req.user.userId;

        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ message: '文章不存在' });
        }

        // 检查是否已经点赞
        if (article.likedBy.includes(userId)) {
            return res.status(400).json({ message: '已经点赞过了' });
        }

        // 添加点赞
        article.likedBy.push(userId);
        article.likeCount += 1;
        await article.save();

        // 同步更新用户数据库
        await User.findByIdAndUpdate(userId, {
            $addToSet: { likes: articleId }
        });

        // 创建消息记录（如果点赞者不是文章作者）
        if (userId.toString() !== article.creator.toString()) {
            const message = new Message({
                sender: userId,
                receiver: article.creator,
                type: 'like',
                article: articleId
            });
            await message.save();
        }

        res.json({ 
            message: '点赞成功',
            likeCount: article.likeCount
        });
    } catch (error) {
        console.error('点赞失败:', error);
        res.status(500).json({ message: '点赞失败' });
    }
};

// 取消点赞
const unlikeArticle = async (req, res) => {
    try {
        const { articleId } = req.params;
        const userId = req.user.userId;

        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ message: '文章不存在' });
        }

        // 检查是否已经点赞
        if (!article.likedBy.includes(userId)) {
            return res.status(400).json({ message: '还没有点赞' });
        }

        // 取消点赞
        article.likedBy = article.likedBy.filter(id => id.toString() !== userId);
        article.likeCount = Math.max(0, article.likeCount - 1);
        await article.save();

        // 同步更新用户数据库
        await User.findByIdAndUpdate(userId, {
            $pull: { likes: articleId }
        });

        res.json({ 
            message: '取消点赞成功',
            likeCount: article.likeCount
        });
    } catch (error) {
        console.error('取消点赞失败:', error);
        res.status(500).json({ message: '取消点赞失败' });
    }
};

// 获取点赞状态
const getLikeStatus = async (req, res) => {
    try {
        const { articleId } = req.params;
        const userId = req.user.userId;

        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ message: '文章不存在' });
        }

        const isLiked = article.likedBy.includes(userId);
        res.json({ 
            isLiked,
            likeCount: article.likeCount || 0
        });
    } catch (error) {
        console.error('获取点赞状态失败:', error);
        res.status(500).json({ message: '获取点赞状态失败' });
    }
};

// 收藏文章
const collectArticle = async (req, res) => {
    try {
        const { articleId } = req.params;
        const userId = req.user.userId;

        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ message: '文章不存在' });
        }

        // 检查是否已经收藏
        if (article.collectedBy.includes(userId)) {
            return res.status(400).json({ message: '已经收藏过了' });
        }

        // 添加收藏
        article.collectedBy.push(userId);
        article.collectCount += 1;
        await article.save();

        // 同步更新用户数据库中的收藏列表
        await User.findByIdAndUpdate(userId, {
            $addToSet: { favorites: articleId }
        });

        // 创建消息记录（如果收藏者不是文章作者）
        if (userId.toString() !== article.creator.toString()) {
            const message = new Message({
                sender: userId,
                receiver: article.creator,
                type: 'collect',
                article: articleId
            });
            await message.save();
        }

        res.json({ 
            message: '收藏成功',
            collectCount: article.collectCount
        });
    } catch (error) {
        console.error('收藏失败:', error);
        res.status(500).json({ message: '收藏失败' });
    }
};

// 取消收藏
const uncollectArticle = async (req, res) => {
    try {
        const { articleId } = req.params;
        const userId = req.user.userId;

        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ message: '文章不存在' });
        }

        // 检查是否已经收藏
        if (!article.collectedBy.includes(userId)) {
            return res.status(400).json({ message: '还没有收藏' });
        }

        // 取消收藏
        article.collectedBy = article.collectedBy.filter(id => id.toString() !== userId);
        article.collectCount = Math.max(0, article.collectCount - 1);
        await article.save();

        // 同步更新用户数据库中的收藏列表
        await User.findByIdAndUpdate(userId, {
            $pull: { favorites: articleId }
        });

        res.json({ 
            message: '取消收藏成功',
            collectCount: article.collectCount
        });
    } catch (error) {
        console.error('取消收藏失败:', error);
        res.status(500).json({ message: '取消收藏失败' });
    }
};

// 获取收藏状态
const getCollectStatus = async (req, res) => {
    try {
        const { articleId } = req.params;
        const userId = req.user.userId;

        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ message: '文章不存在' });
        }

        const isCollected = article.collectedBy.includes(userId);
        res.json({ 
            isCollected,
            collectCount: article.collectCount || 0
        });
    } catch (error) {
        console.error('获取收藏状态失败:', error);
        res.status(500).json({ message: '获取收藏状态失败' });
    }
};

// 搜索文章
const searchArticles = async (req, res) => {
    try {
        const { keyword } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;

        // 构建搜索条件
        const searchQuery = {
            $or: [
                { title: { $regex: keyword, $options: 'i' } },
                { content: { $regex: keyword, $options: 'i' } }
            ]
        };

        // 执行搜索
        const articles = await Article.find(searchQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('creator', 'nickname avatar')
            .populate('mentionedUsers', 'nickname avatar');

        // 获取每篇文章的图片
        const articlesWithImages = await Promise.all(articles.map(async (article) => {
            const images = await Image.find({ article: article._id });
            return {
                ...article.toObject(),
                images: images.map(img => img.imageUrl.split('/').pop()),
                creator: article.creator ? {
                    ...article.creator.toObject(),
                    avatar: article.creator.avatar ? article.creator.avatar.split('/').pop() : 'default-avatar.jpg'
                } : null,
                mentionedUsers: article.mentionedUsers ? article.mentionedUsers.map(user => ({
                    ...user.toObject(),
                    avatar: user.avatar ? user.avatar.split('/').pop() : 'default-avatar.jpg'
                })) : []
            };
        }));

        // 获取搜索结果总数
        const total = await Article.countDocuments(searchQuery);

        res.json({
            articles: articlesWithImages,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalArticles: total
        });
    } catch (error) {
        console.error('搜索文章失败:', error);
        res.status(500).json({ 
            message: '搜索文章失败',
            error: error.message 
        });
    }
};

// 删除文章
const deleteArticle = async (req, res) => {
    try {
        const { articleId } = req.params;
        const userId = req.user.userId;

        // 查找文章
        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ message: '文章不存在' });
        }

        // 获取当前用户信息
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }

        // 验证权限（文章作者、管理员或超级管理员可以删除）
        if (article.creator.toString() !== userId && !['admin', 'superadmin'].includes(user.role)) {
            return res.status(403).json({ message: '没有权限删除此文章' });
        }

        // 获取文章相关的图片
        const images = await Image.find({ article: articleId });
        
        // 删除图片文件
        for (const image of images) {
            try {
                const imageUrl = image.imageUrl.split('/').pop();
                const imagePath = path.resolve(__dirname, '..', 'uploads', 'images', imageUrl);
                await fs.promises.unlink(imagePath);
                console.log('删除图片文件成功:', imagePath);
            } catch (error) {
                console.error('删除图片文件失败:', error);
            }
        }

        // 删除视频文件（如果有）
        if (article.video && article.video.url) {
            try {
                const videoUrl = article.video.url.split('/').pop();
                const videoPath = path.resolve(__dirname, '..', 'uploads', 'videos', videoUrl);
                await fs.promises.unlink(videoPath);
                console.log('删除视频文件成功:', videoPath);
            } catch (error) {
                console.error('删除视频文件失败:', error);
            }
        }

        // 删除图片记录
        await Image.deleteMany({ article: articleId });

        // 删除相关的评论
        await Comment.deleteMany({ article: articleId });

        // 删除文章
        await Article.findByIdAndDelete(articleId);

        // 从用户的点赞和收藏列表中移除
        await User.updateMany(
            { $or: [{ likes: articleId }, { favorites: articleId }] },
            { 
                $pull: { 
                    likes: articleId,
                    favorites: articleId
                }
            }
        );

        res.json({ message: '文章删除成功' });
    } catch (error) {
        console.error('删除文章失败:', error);
        res.status(500).json({ message: '删除文章失败' });
    }
};

// 获取指定用户发布的文章
const getUserArticlesById = async (req, res) => {
    try {
        const { userId } = req.params;
        const articles = await Article.find({ creator: userId })
            .sort({ createdAt: -1 })
            .populate('creator', 'nickname avatar');

        // 获取每篇文章的图片
        const articlesWithImages = await Promise.all(articles.map(async (article) => {
            const images = await Image.find({ article: article._id });
            return {
                ...article.toObject(),
                images: images.map(img => img.imageUrl.split('/').pop()),
                creator: article.creator ? {
                    ...article.creator.toObject(),
                    avatar: article.creator.avatar ? article.creator.avatar.split('/').pop() : 'default-avatar.jpg'
                } : null,
                isLiked: article.likedBy.includes(req.user.userId)
            };
        }));

        res.json({ articles: articlesWithImages });
    } catch (err) {
        console.error('获取用户文章错误:', err);
        res.status(500).json({ message: '服务器错误' });
    }
};

// 获取单个文章详情
const getArticleById = async (req, res) => {
    try {
        const { articleId } = req.params;
        console.log('获取文章详情，ID:', articleId);

        // 先获取原始文章数据
        const rawArticle = await Article.findById(articleId);
        console.log('原始文章数据:', {
            id: rawArticle?._id,
            mentionedUsers: rawArticle?.mentionedUsers,
            adminMentions: rawArticle?.adminMentions
        });

        const article = await Article.findById(articleId)
            .populate('creator', 'nickname avatar')
            .populate('mentionedUsers', 'nickname avatar _id');

        if (!article) {
            console.log('文章不存在:', articleId);
            return res.status(404).json({ message: '文章不存在' });
        }

        console.log('填充后的文章数据:', {
            id: article._id,
            mentionedUsers: article.mentionedUsers,
            adminMentions: article.adminMentions
        });

        // 获取文章图片
        const images = await Image.find({ article: articleId });
        
        // 获取文章评论
        const comments = await Comment.find({ article: articleId })
            .populate('commenter', 'nickname avatar')
            .sort({ createdAt: -1 });

        const articleObj = article.toObject();
        
        // 添加图片信息
        articleObj.images = images.map(img => img.imageUrl.split('/').pop());
        
        // 添加评论信息
        articleObj.comments = comments.map(comment => ({
            ...comment.toObject(),
            creator: comment.commenter // 重命名为 creator 以匹配前端期望
        }));

        // 处理被艾特用户信息
        articleObj.mentionedUsers = article.mentionedUsers ? article.mentionedUsers.map(user => ({
            _id: user._id,
            nickname: user.nickname,
            avatar: user.avatar ? user.avatar.split('/').pop() : 'default-avatar.jpg'
        })) : [];

        // 保留并格式化 adminMentions 信息
        articleObj.adminMentions = article.adminMentions || [];
        
        // 如果用户已登录，检查点赞和收藏状态
        if (req.user) {
            articleObj.isLiked = article.likedBy.includes(req.user.userId);
            articleObj.isCollected = article.collectedBy.includes(req.user.userId);
        }

        console.log('最终返回的文章详情:', {
            id: articleObj._id,
            mentionedUsers: articleObj.mentionedUsers,
            adminMentions: articleObj.adminMentions
        });

        res.json(articleObj);
    } catch (error) {
        console.error('获取文章详情失败:', error);
        res.status(500).json({ message: '获取文章详情失败' });
    }
};

module.exports = {
    createArticle,
    getArticles,
    getArticlesByTopic,
    getMentionedArticles,
    getArticleComments,
    addComment,
    deleteComment,
    getUserArticles,
    getUserArticlesById,
    getUserFavorites,
    getUserLikes,
    likeArticle,
    unlikeArticle,
    getLikeStatus,
    collectArticle,
    uncollectArticle,
    getCollectStatus,
    searchArticles,
    deleteArticle,
    getArticleById
}; 