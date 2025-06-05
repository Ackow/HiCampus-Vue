// 图片上传控制器
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: '没有上传文件' });
        }

        // 构建图片URL
        const imageUrl = `/uploads/images/${req.file.filename}`;
        
        res.json({
            message: '图片上传成功',
            url: imageUrl
        });
    } catch (error) {
        console.error('图片上传错误:', error);
        res.status(500).json({ message: '图片上传失败' });
    }
};

// 视频上传控制器
const uploadVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: '没有上传文件' });
        }

        // 构建视频URL
        const videoUrl = `/uploads/videos/${req.file.filename}`;
        
        res.json({
            message: '视频上传成功',
            url: videoUrl
        });
    } catch (error) {
        console.error('视频上传错误:', error);
        res.status(500).json({ message: '视频上传失败' });
    }
};

module.exports = {
    uploadImage,
    uploadVideo
}; 