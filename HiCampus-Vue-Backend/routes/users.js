const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const uploadController = require('../controllers/uploadController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// 用户注册
router.post('/register', userController.register);

// 用户登录
router.post('/login', userController.login);

// 获取用户信息
router.get('/profile', auth, userController.getUserInfo);

// 更新用户信息
router.put('/profile', auth, userController.updateUserInfo);

// 上传头像
router.post('/avatar', auth, upload.single('avatar'), userController.uploadAvatar);

// 上传图片
router.post('/upload/image', auth, upload.single('image'), uploadController.uploadImage);

// 搜索用户
router.get('/users/search', auth, userController.searchUsers);

module.exports = router; 