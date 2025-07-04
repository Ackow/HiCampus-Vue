const Message = require('../models/Message');
const Article = require('../models/Article');
const Image = require('../models/Image');

// 获取用户的消息列表
const getMessages = async (req, res) => {
    try {
        const userId = req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        console.log('获取消息列表，用户ID:', userId);

        // 获取消息列表
        const messages = await Message.find({ receiver: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender', 'nickname avatar')
            .populate('article', 'title images')
            .lean();

        console.log('查询到的消息数量:', messages.length);

        // 获取每篇文章的图片
        const messagesWithImages = await Promise.all(messages.map(async (message) => {
            let postImage = '';
            
            if (message.article && message.article._id) {
                try {
                    const images = await Image.find({ article: message.article._id });
                    if (images && images.length > 0) {
                        postImage = images[0].imageUrl;
                        console.log('找到文章图片:', postImage);
                    } else {
                        console.log('文章没有图片:', message.article._id);
                    }
                } catch (error) {
                    console.error('获取文章图片失败:', error);
                }
            } else {
                console.log('消息没有关联文章或文章ID无效');
            }
            
            return {
                ...message,
                username: message.sender.nickname,
                avatar: message.sender.avatar ? message.sender.avatar.split('/').pop() : '',
                postImage,
                action: getActionText(message.type),
                time: formatTime(message.createdAt)
            };
        }));

        // 获取消息总数
        const total = await Message.countDocuments({ receiver: userId });
        console.log('消息总数:', total);

        res.json({
            messages: messagesWithImages,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalMessages: total
        });
    } catch (error) {
        console.error('获取消息列表失败:', error);
        res.status(500).json({ message: '获取消息列表失败' });
    }
};

// 标记消息为已读
const markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.userId;

        const message = await Message.findOne({
            _id: messageId,
            receiver: userId
        });

        if (!message) {
            return res.status(404).json({ message: '消息不存在' });
        }

        message.isRead = true;
        await message.save();

        res.json({ message: '标记已读成功' });
    } catch (error) {
        console.error('标记消息已读失败:', error);
        res.status(500).json({ message: '标记消息已读失败' });
    }
};

// 标记所有消息为已读
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.userId;

        await Message.updateMany(
            { receiver: userId, isRead: false },
            { isRead: true }
        );

        res.json({ message: '全部标记已读成功' });
    } catch (error) {
        console.error('标记所有消息已读失败:', error);
        res.status(500).json({ message: '标记所有消息已读失败' });
    }
};

// 获取未读消息数量
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.userId;

        const count = await Message.countDocuments({
            receiver: userId,
            isRead: false
        });

        res.json({ unreadCount: count });
    } catch (error) {
        console.error('获取未读消息数量失败:', error);
        res.status(500).json({ message: '获取未读消息数量失败' });
    }
};

// 辅助函数：获取动作文本
const getActionText = (type) => {
    switch (type) {
        case 'like':
            return '赞了你的帖子。';
        case 'comment':
            return '评论了你的帖子。';
        case 'collect':
            return '收藏了你的帖子。';
        case 'mention':
            return '在帖子中提到了你。';
        default:
            return '';
    }
};

// 辅助函数：格式化时间
const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) {
        return `${minutes}分钟前`;
    } else if (hours < 24) {
        return `${hours}小时前`;
    } else if (days < 7) {
        return `${days}天前`;
    } else {
        return `${date.getMonth() + 1}-${date.getDate()}`;
    }
};

// 删除所有消息
const deleteAllMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    await Message.deleteMany({ receiver: userId });
    res.json({ message: '所有消息已删除' });
  } catch (error) {
    console.error('删除所有消息失败:', error);
    res.status(500).json({ message: '删除所有消息失败' });
  }
};

// 删除文章相关的所有消息
const deleteArticleMessages = async (req, res) => {
  try {
    const { articleId } = req.params;
    await Message.deleteMany({ article: articleId });
    res.json({ message: '文章相关消息已删除' });
  } catch (error) {
    console.error('删除文章相关消息失败:', error);
    res.status(500).json({ message: '删除文章相关消息失败' });
  }
};

module.exports = {
    getMessages,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    deleteAllMessages,
    deleteArticleMessages
}; 