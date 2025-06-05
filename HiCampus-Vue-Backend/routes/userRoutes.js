const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const uploadController = require('../controllers/uploadController');
const articleController = require('../controllers/articleController');
const authenticateToken = require('../middleware/auth');
const { upload, uploadVideo } = require('../middleware/upload');

// 注册路由
router.post('/register', userController.register);

// 登录路由
router.post('/login', userController.login);

// 获取用户信息路由
router.get('/', authenticateToken, userController.getUserInfo);

// 搜索用户路由
router.get('/search', userController.searchUsers);

// 上传头像路由
router.post('/upload/avatar', authenticateToken, upload.single('avatar'), userController.uploadAvatar);

// 更新用户信息路由
router.put('/update', authenticateToken, userController.updateUserInfo);

// 图片上传路由
router.post('/upload/image', authenticateToken, upload.single('image'), uploadController.uploadImage);

// 视频上传路由
router.post('/upload/video', authenticateToken, uploadVideo.single('video'), uploadController.uploadVideo);

// 关注相关路由
router.get('/:userId/follow-status', authenticateToken, userController.checkFollowStatus);
router.get('/:userId/following', authenticateToken, userController.getFollowing);
router.get('/:userId/followers', authenticateToken, userController.getFollowers);
router.post('/:userId/follow', authenticateToken, userController.followUser);
router.delete('/:userId/follow', authenticateToken, userController.unfollowUser);

// 获取指定用户信息路由（放在最后，避免覆盖其他具体路由）
router.get('/:userId', authenticateToken, userController.getUserById);

module.exports = router; 