const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());

// 静态文件服务 - 头像
app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads/avatars')));

// 静态文件服务 - 图片
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads/images')));

// 路由配置
app.use('/api', require('./routes/userRoutes'));

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: '服务器内部错误' });
});

module.exports = app; 