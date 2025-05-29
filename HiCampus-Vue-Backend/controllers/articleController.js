const Article = require('../models/Article');
const Image = require('../models/Image');

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
        const { title, content, images, mentionedUsers, topics } = req.body;
        
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
            mentionedUsersCount: mentionedUsers ? mentionedUsers.length : 0,
            topicsCount: topics ? topics.length : 0
        });

        // 创建文章
        const article = new Article({
            creator: req.user.userId,
            title,
            content,
            likeCount: 0,
            commentCount: 0,
            mentionedUsers: mentionedUsers || [],
            topics: topics || []
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

module.exports = {
    createArticle,
    getArticles,
    getArticlesByTopic,
    getMentionedArticles
}; 