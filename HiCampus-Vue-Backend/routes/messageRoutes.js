const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authenticateToken = require('../middleware/auth');

// 获取消息列表
router.get('/messages', authenticateToken, messageController.getMessages);

// 标记消息为已读
router.put('/messages/:messageId/read', authenticateToken, messageController.markAsRead);

// 标记所有消息为已读
router.put('/messages/read-all', authenticateToken, messageController.markAllAsRead);

// 获取未读消息数量
router.get('/messages/unread-count', authenticateToken, messageController.getUnreadCount);

// 删除所有消息
router.delete('/messages/all', authenticateToken, messageController.deleteAllMessages);

// 删除文章相关的所有消息
router.delete('/messages/article/:articleId', authenticateToken, messageController.deleteArticleMessages);

module.exports = router; 