const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const authenticateToken = require('../middleware/auth');

// 获取文章列表
router.get('/articles', articleController.getArticles);

// 按话题获取文章
router.get('/articles/topic/:topic', articleController.getArticlesByTopic);

// 获取被艾特的文章
router.get('/articles/mentioned', authenticateToken, articleController.getMentionedArticles);

// 创建文章
router.post('/articles', authenticateToken, articleController.createArticle);

module.exports = router;