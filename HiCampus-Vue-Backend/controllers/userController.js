const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

// 错误处理中间件
const handleError = (res, error, message = '服务器错误') => {
    console.error(`${message}:`, error);
    res.status(500).json({ message });
};

// 注册用户
const register = async (req, res) => {
    try {
        const { username, password, nickname, studentId, college } = req.body;

        // 验证必填字段
        if (!username || !password || !nickname) {
            return res.status(400).json({ message: '用户名、密码和昵称不能为空' });
        }

        // 验证密码强度
        if (password.length < 6) {
            return res.status(400).json({ message: '密码长度至少为6位' });
        }

        // 检查用户名是否已存在
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: '用户名已存在' });
        }

        // 如果提供了学号，检查学号是否已存在
        if (studentId) {
            const existingStudent = await User.findOne({ studentId });
            if (existingStudent) {
                return res.status(400).json({ message: '学号已被使用' });
            }
        }

        console.log('开始创建新用户');
        // 创建新用户
        const user = new User({
            username,
            password,
            nickname,
            studentId,
            college,
            age: '18',
            gender: 'male',
            avatar: 'default-avatar.jpg',
            // 如果是第一个用户，设置为管理员
            role: (await User.countDocuments()) === 0 ? 'admin' : 'user'
        });

        console.log('保存用户前:', user);
        await user.save();
        console.log('保存用户后:', user);

        // 生成JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: '注册成功',
            token,
            user: {
                id: user._id,
                username: user.username,
                nickname: user.nickname,
                studentId: user.studentId,
                college: user.college,
                role: user.role,
                avatar: `http://localhost:3000/uploads/avatars/${user.avatar}`
            }
        });
    } catch (error) {
        console.error('注册错误:', error);
        handleError(res, error, '注册错误');
    }
};

// 用户登录
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: '用户名和密码不能为空' });
        }

        // 查找用户
        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 验证密码
        const isValidPassword = await user.comparePassword(password);
        
        if (!isValidPassword) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 生成JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            message: '登录成功',
            token,
            user: {
                id: user._id,
                username: user.username,
                nickname: user.nickname,
                studentId: user.studentId,
                uid: user.uid,
                age: user.age,
                gender: user.gender,
                role: user.role,
                avatar: `http://localhost:3000/uploads/avatars/${user.avatar}`
            }
        });
    } catch (error) {
        console.error('登录错误:', error);
        handleError(res, error, '登录错误');
    }
};

// 获取用户信息
const getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }

        res.json({
            user: {
                id: user._id,
                username: user.username,
                nickname: user.nickname,
                studentId: user.studentId,
                college: user.college,
                uid: user.uid,
                age: user.age,
                gender: user.gender,
                role: user.role,
                avatar: `http://localhost:3000/uploads/avatars/${user.avatar}`
            }
        });
    } catch (error) {
        handleError(res, error, '获取用户信息错误');
    }
};

// 更新用户信息
const updateUserInfo = async (req, res) => {
    try {
        const { username, nickname, studentId, age, gender, password, college } = req.body;
        const userId = req.user.userId;

        // 构建更新对象
        const updateData = {};

        // 处理用户名更新
        if (username) {
            if (username.length < 3 || username.length > 20) {
                return res.status(400).json({ message: '用户名长度必须在3-20个字符之间' });
            }
            // 检查用户名是否已被其他用户使用
            const existingUser = await User.findOne({ 
                username, 
                _id: { $ne: userId } 
            });
            if (existingUser) {
                return res.status(400).json({ message: '用户名已被其他用户使用' });
            }
            updateData.username = username;
        }

        // 处理昵称更新
        if (nickname && nickname.length > 6) {
            return res.status(400).json({ message: '昵称长度不能超过6个字符' });
        }
        if (nickname) {
            updateData.nickname = nickname;
        }

        // 处理年龄更新
        if (age) {
            const ageNum = parseInt(age);
            if (isNaN(ageNum) || ageNum < 1 || ageNum > 99) {
                return res.status(400).json({ message: '年龄必须在1-99岁之间' });
            }
            updateData.age = ageNum;
        }

        // 处理性别更新
        if (gender) {
            if (!['male', 'female'].includes(gender)) {
                return res.status(400).json({ message: '性别值无效' });
            }
            updateData.gender = gender;
        }

        // 处理密码更新
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ message: '密码长度至少为6个字符' });
            }
            updateData.password = await bcrypt.hash(password, 10);
        }
        
        // 处理学号更新
        if (studentId !== undefined) {
            if (studentId && !/^\d{8,12}$/.test(studentId)) {
                return res.status(400).json({ message: '学号格式不正确' });
            }
            // 检查学号是否已被其他用户使用
            if (studentId) {
                const existingStudent = await User.findOne({ 
                    studentId, 
                    _id: { $ne: userId } 
                });
                if (existingStudent) {
                    return res.status(400).json({ message: '学号已被其他用户使用' });
                }
            }
            updateData.studentId = studentId || null;
        }

        // 处理学院更新
        if (college !== undefined) {
            updateData.college = college;
        }

        // 更新用户信息
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, select: '-password' }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: '用户不存在' });
        }

        res.json({
            message: '更新成功',
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                nickname: updatedUser.nickname,
                studentId: updatedUser.studentId,
                college: updatedUser.college,
                age: updatedUser.age,
                gender: updatedUser.gender,
                avatar: `http://localhost:3000/uploads/avatars/${updatedUser.avatar}`
            }
        });
    } catch (error) {
        console.error('更新用户信息错误:', error);
        handleError(res, error, '更新用户信息错误');
    }
};

// 上传头像
const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: '请选择要上传的图片' });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }

        // 删除旧头像（如果不是默认头像）
        if (user.avatar !== 'default-avatar.jpg') {
            const oldAvatarPath = path.join(__dirname, '../uploads/avatars', user.avatar);
            try {
                if (fs.existsSync(oldAvatarPath)) {
                    fs.unlinkSync(oldAvatarPath);
                }
            } catch (error) {
                console.error('删除旧头像失败:', error);
                // 继续执行，不中断上传流程
            }
        }

        // 更新用户头像
        user.avatar = req.file.filename;
        await user.save();

        // 返回完整的头像URL
        const avatarUrl = `http://localhost:3000/uploads/avatars/${req.file.filename}`;
        res.json({
            message: '头像上传成功',
            avatar: avatarUrl
        });
    } catch (error) {
        console.error('上传头像错误:', error);
        handleError(res, error, '上传头像错误');
    }
};

// 搜索用户
const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: '搜索关键词不能为空' });
        }

        const users = await User.find({
            $or: [
                { username: new RegExp(q, 'i') },
                { nickname: new RegExp(q, 'i') },
                { studentId: new RegExp(q, 'i') }
            ]
        }).select('-password').limit(10);

        res.json({
            users: users.map(user => ({
                id: user._id,
                username: user.username,
                nickname: user.nickname,
                studentId: user.studentId,
                avatar: `http://localhost:3000/uploads/avatars/${user.avatar}`
            }))
        });
    } catch (error) {
        handleError(res, error, '搜索用户错误');
    }
};

// 获取指定用户信息
const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }

        res.json({
            user: {
                id: user._id,
                username: user.username,
                nickname: user.nickname,
                studentId: user.studentId,
                college: user.college,
                uid: user.uid,
                age: user.age,
                gender: user.gender,
                avatar: `http://localhost:3000/uploads/avatars/${user.avatar}`
            }
        });
    } catch (error) {
        handleError(res, error, '获取用户信息错误');
    }
};

module.exports = {
    register,
    login,
    getUserInfo,
    updateUserInfo,
    uploadAvatar,
    searchUsers,
    getUserById
}; 