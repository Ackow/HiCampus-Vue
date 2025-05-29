const mongoose = require('mongoose');

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
    avatar: { 
        type: String, 
        default: 'default-avatar.jpg'
    },
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
});

// 在保存用户之前生成uid
userSchema.pre('save', async function(next) {
    if (!this.uid) {
        const counter = await Counter.findByIdAndUpdate(
            'userId',
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this.uid = counter.seq.toString().padStart(12, '0');
    }
    next();
});

// 添加索引
userSchema.index({ username: 1 });
userSchema.index({ studentId: 1 });
userSchema.index({ nickname: 1 });

module.exports = mongoose.model('User', userSchema); 