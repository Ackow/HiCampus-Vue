const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const authenticateToken = require('../middleware/auth');

// 搜索文章 - 放在最前面
router.get('/articles/search', authenticateToken, articleController.searchArticles);

// 获取文章列表
router.get('/articles', articleController.getArticles);

// 按话题获取文章
router.get('/articles/topic/:topic', articleController.getArticlesByTopic);

// 获取被艾特的文章
router.get('/articles/mentioned', authenticateToken, articleController.getMentionedArticles);

// 获取用户发布的文章
router.get('/articles/user', authenticateToken, articleController.getUserArticles);

// 获取用户收藏的文章
router.get('/articles/favorites', authenticateToken, articleController.getUserFavorites);

// 获取用户点赞的文章
router.get('/articles/likes', authenticateToken, articleController.getUserLikes);

// 创建文章
router.post('/articles', authenticateToken, articleController.createArticle);

// 获取文章评论
router.get('/articles/:articleId/comments', articleController.getArticleComments);

// 添加评论
router.post('/articles/:articleId/comments', authenticateToken, articleController.addComment);

// 删除评论
router.delete('/articles/:articleId/comments/:commentId', authenticateToken, articleController.deleteComment);

// 点赞文章
router.post('/articles/:articleId/like', authenticateToken, articleController.likeArticle);

// 取消点赞
router.delete('/articles/:articleId/like', authenticateToken, articleController.unlikeArticle);

// 获取文章点赞状态
router.get('/articles/:articleId/like-status', authenticateToken, articleController.getLikeStatus);

// 收藏文章
router.post('/articles/:articleId/collect', authenticateToken, articleController.collectArticle);

// 取消收藏
router.delete('/articles/:articleId/collect', authenticateToken, articleController.uncollectArticle);

// 获取文章收藏状态
router.get('/articles/:articleId/collect-status', authenticateToken, articleController.getCollectStatus);

// 删除文章
router.delete('/articles/:articleId', authenticateToken, articleController.deleteArticle);

module.exports = router;