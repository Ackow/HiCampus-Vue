const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const ensureUploadDir = (dirPath) => {
    const absolutePath = path.resolve(__dirname, '..', dirPath);
    if (!fs.existsSync(absolutePath)) {
        fs.mkdirSync(absolutePath, { recursive: true });
    }
    return absolutePath;
};

// 配置文件存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 根据文件类型选择不同的存储目录
        let relativePath;
        if (file.fieldname === 'avatar') {
            relativePath = 'uploads/avatars';
        } else if (file.fieldname === 'video') {
            relativePath = 'uploads/videos';
        } else {
            relativePath = 'uploads/images';
        }
        // 确保目录存在并获取绝对路径
        const absolutePath = ensureUploadDir(relativePath);
        cb(null, absolutePath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('只允许上传图片或视频文件！'), false);
    }
};

// 图片上传配置
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 限制5MB
    }
});

// 视频上传配置
const uploadVideo = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024 // 限制20MB
    }
});

module.exports = {
    upload,
    uploadVideo
}; 