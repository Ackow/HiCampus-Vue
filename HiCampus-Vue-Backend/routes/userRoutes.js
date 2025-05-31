const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const uploadController = require('../controllers/uploadController');
const articleController = require('../controllers/articleController');
const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/upload');

// 注册路由
router.post('/register', userController.register);

// 登录路由
router.post('/login', userController.login);

// 获取用户信息路由
router.get('/', authenticateToken, userController.getUserInfo);

// 获取指定用户信息路由
router.get('/:userId', authenticateToken, userController.getUserById);

// 搜索用户路由
router.get('/users/search', userController.searchUsers);

// 上传头像路由
router.post('/upload/avatar', authenticateToken, upload.single('avatar'), userController.uploadAvatar);

// 更新用户信息路由
router.put('/update', authenticateToken, userController.updateUserInfo);

// 图片上传路由
router.post('/upload/image', authenticateToken, upload.single('image'), uploadController.uploadImage);

module.exports = router; 