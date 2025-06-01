const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// 连接数据库
const MONGODB_URI = 'mongodb://localhost:27017/hicampus';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('数据库连接成功'))
    .catch(err => {
        console.error('数据库连接失败:', err);
        process.exit(1);
    });

// 显示帮助信息
function showHelp() {
    console.log(`
用户管理工具使用说明：
1. 列出所有用户：node manageUsers.js list
2. 查看用户详情：node manageUsers.js view <username>
3. 修改用户角色：node manageUsers.js role <username> <role>
   可用角色：user, moderator, admin, superadmin
4. 激活/禁用用户：node manageUsers.js toggle <username>
5. 显示帮助：node manageUsers.js help
    `);
}

// 列出所有用户
async function listUsers() {
    try {
        const users = await User.find().select('username role isActive');
        console.log('\n用户列表：');
        users.forEach(user => {
            console.log(`用户名: ${user.username}`);
            console.log(`角色: ${user.role}`);
            console.log(`状态: ${user.isActive ? '激活' : '禁用'}`);
            console.log('-------------------');
        });
    } catch (error) {
        console.error('获取用户列表失败:', error);
    }
}

// 查看用户详情
async function viewUser(username) {
    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.log('用户不存在');
            return;
        }
        console.log('\n用户详情：');
        console.log(`用户名: ${user.username}`);
        console.log(`昵称: ${user.nickname}`);
        console.log(`角色: ${user.role}`);
        console.log(`状态: ${user.isActive ? '激活' : '禁用'}`);
        console.log('权限:');
        console.log(`- 管理用户: ${user.permissions.canManageUsers}`);
        console.log(`- 管理内容: ${user.permissions.canManageContent}`);
        console.log(`- 管理系统: ${user.permissions.canManageSystem}`);
        console.log(`- 查看统计: ${user.permissions.canViewAnalytics}`);
        console.log(`创建时间: ${user.createdAt}`);
        console.log(`最后登录: ${user.lastLogin}`);
    } catch (error) {
        console.error('获取用户详情失败:', error);
    }
}

// 修改用户角色
async function changeRole(username, newRole) {
    try {
        const validRoles = ['user', 'moderator', 'admin', 'superadmin'];
        if (!validRoles.includes(newRole)) {
            console.log('无效的角色，可用角色：', validRoles.join(', '));
            return;
        }

        const user = await User.findOne({ username });
        if (!user) {
            console.log('用户不存在');
            return;
        }

        user.role = newRole;
        await user.save();
        console.log(`已将用户 ${username} 的角色修改为 ${newRole}`);
    } catch (error) {
        console.error('修改用户角色失败:', error);
    }
}

// 激活/禁用用户
async function toggleUser(username) {
    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.log('用户不存在');
            return;
        }

        user.isActive = !user.isActive;
        await user.save();
        console.log(`用户 ${username} 已${user.isActive ? '激活' : '禁用'}`);
    } catch (error) {
        console.error('修改用户状态失败:', error);
    }
}

// 主函数
async function main() {
    const command = process.argv[2];
    const username = process.argv[3];
    const role = process.argv[4];

    switch (command) {
        case 'list':
            await listUsers();
            break;
        case 'view':
            if (!username) {
                console.log('请提供用户名');
                return;
            }
            await viewUser(username);
            break;
        case 'role':
            if (!username || !role) {
                console.log('请提供用户名和新角色');
                return;
            }
            await changeRole(username, role);
            break;
        case 'toggle':
            if (!username) {
                console.log('请提供用户名');
                return;
            }
            await toggleUser(username);
            break;
        case 'help':
        default:
            showHelp();
    }

    mongoose.connection.close();
}

main().catch(console.error); 