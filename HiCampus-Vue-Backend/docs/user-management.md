# 用户权限管理命令说明

## 简介
本文档介绍了如何使用命令行工具管理用户权限。该工具提供了查看用户信息、修改用户角色、激活/禁用用户等功能。

## 前置条件
1. 确保已安装 Node.js
2. 确保 MongoDB 服务已启动
3. 确保项目依赖已安装（运行 `npm install`）

## 命令列表

### 1. 查看所有用户
```bash
node scripts/manageUsers.js list
```
输出示例：
```
用户列表：
用户名: user1
角色: user
状态: 激活
-------------------
用户名: admin1
角色: admin
状态: 激活
-------------------
```

### 2. 查看用户详情
```bash
node scripts/manageUsers.js view <username>
```
输出示例：
```
用户详情：
用户名: admin1
昵称: 管理员
角色: admin
状态: 激活
权限:
- 管理用户: true
- 管理内容: true
- 管理系统: false
- 查看统计: true
创建时间: 2024-01-01T00:00:00.000Z
最后登录: 2024-01-02T00:00:00.000Z
```

### 3. 修改用户角色
```bash
node scripts/manageUsers.js role <username> <role>
```
可用角色：
- `user`: 普通用户
- `moderator`: 内容管理员
- `admin`: 系统管理员
- `superadmin`: 超级管理员

示例：
```bash
node scripts/manageUsers.js role user1 admin
```

### 4. 激活/禁用用户
```bash
node scripts/manageUsers.js toggle <username>
```
示例：
```bash
node scripts/manageUsers.js toggle user1
```

### 5. 显示帮助信息
```bash
node scripts/manageUsers.js help
```

## 权限说明

### 角色权限对照表

| 角色 | 管理用户 | 管理内容 | 管理系统 | 查看统计 |
|------|----------|----------|----------|----------|
| superadmin | ✅ | ✅ | ✅ | ✅ |
| admin | ✅ | ✅ | ❌ | ✅ |
| moderator | ❌ | ✅ | ❌ | ❌ |
| user | ❌ | ❌ | ❌ | ❌ |

### 权限说明
- `canManageUsers`: 可以管理用户账号（修改角色、禁用账号等）
- `canManageContent`: 可以管理内容（删除文章、评论等）
- `canManageSystem`: 可以管理系统设置
- `canViewAnalytics`: 可以查看统计数据

## 注意事项
1. 只有管理员（admin）和超级管理员（superadmin）可以执行用户管理操作
2. 修改用户角色会自动更新相应的权限设置
3. 禁用用户后，该用户将无法登录系统
4. 所有操作都会记录在日志中

## 常见问题

### 1. 数据库连接失败
确保 MongoDB 服务已启动，并且连接字符串正确。

### 2. 权限不足
确保当前用户具有管理员权限。

### 3. 用户不存在
检查用户名是否正确，可以使用 `list` 命令查看所有用户。

## 最佳实践
1. 定期检查用户权限设置
2. 遵循最小权限原则
3. 及时禁用不活跃的用户
4. 记录所有权限变更操作

## 相关文件
- `scripts/manageUsers.js`: 用户管理脚本
- `models/User.js`: 用户模型定义
- `docs/user-management.md`: 本文档 