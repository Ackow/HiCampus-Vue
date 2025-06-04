const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 创建计数器模型
const CounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', CounterSchema);

const userSchema = new mongoose.Schema({
    uid: { type: String, unique: true },
    username: { 
        type: String, 
        required: [true, '用户名不能为空'],
        unique: true,
        trim: true,
        minlength: [3, '用户名长度至少为3个字符'],
        maxlength: [20, '用户名长度不能超过20个字符']
    },
    password: { 
        type: String, 
        required: [true, '密码不能为空'],
        minlength: [6, '密码长度至少为6个字符']
    },
    role: {
        type: String,
        enum: ['user', 'moderator', 'admin', 'superadmin'],
        default: 'user'
    },
    permissions: {
        canManageUsers: { type: Boolean, default: false },
        canManageContent: { type: Boolean, default: false },
        canManageSystem: { type: Boolean, default: false },
        canViewAnalytics: { type: Boolean, default: false }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    nickname: { 
        type: String, 
        required: [true, '昵称不能为空'],
        trim: true,
        minlength: [2, '昵称长度至少为2个字符'],
        maxlength: [20, '昵称长度不能超过20个字符']
    },
    studentId: { 
        type: String, 
        unique: true, 
        sparse: true,
        trim: true,
        match: [/^\d{8,12}$/, '学号格式不正确']
    },
    college: {
        type: String,
        trim: true,
        default: ''
    },
    avatar: { 
        type: String, 
        default: 'http://localhost:3000/uploads/avatars/default-avatar.jpg'
    },
    bio: {
        type: String,
        default: ''
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article'
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article'
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female'] },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// 在保存用户之前生成uid
userSchema.pre('save', async function(next) {
    try {
        console.log('pre save hook 开始执行');
        // 生成uid
        if (!this.uid) {
            console.log('生成新的uid');
            const counter = await Counter.findByIdAndUpdate(
                'userId',
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            this.uid = counter.seq.toString().padStart(12, '0');
        }

        // 如果密码被修改，重新加密
        if (this.isModified('password')) {
            console.log('密码被修改，开始加密');
            console.log('原始密码:', this.password);
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            console.log('加密后的密码:', this.password);
        }

        // 根据角色自动设置权限
        if (this.isModified('role')) {
            switch (this.role) {
                case 'superadmin':
                    this.permissions = {
                        canManageUsers: true,
                        canManageContent: true,
                        canManageSystem: true,
                        canViewAnalytics: true
                    };
                    break;
                case 'admin':
                    this.permissions = {
                        canManageUsers: true,
                        canManageContent: true,
                        canManageSystem: false,
                        canViewAnalytics: true
                    };
                    break;
                case 'moderator':
                    this.permissions = {
                        canManageUsers: false,
                        canManageContent: true,
                        canManageSystem: false,
                        canViewAnalytics: false
                    };
                    break;
                default:
                    this.permissions = {
                        canManageUsers: false,
                        canManageContent: false,
                        canManageSystem: false,
                        canViewAnalytics: false
                    };
            }
        }

        console.log('pre save hook 执行完成');
        next();
    } catch (error) {
        console.error('pre save hook 错误:', error);
        next(error);
    }
});

// 验证密码方法
userSchema.methods.comparePassword = async function(candidatePassword) {
    console.log('比较密码:');
    console.log('输入的密码:', candidatePassword);
    console.log('存储的密码哈希:', this.password);
    const result = await bcrypt.compare(candidatePassword, this.password);
    console.log('密码比较结果:', result);
    return result;
};

// 检查权限方法
userSchema.methods.hasPermission = function(permission) {
    return this.permissions[permission] || false;
};

// 检查是否为管理员
userSchema.methods.isAdmin = function() {
    return ['admin', 'superadmin'].includes(this.role);
};

module.exports = mongoose.model('User', userSchema); 