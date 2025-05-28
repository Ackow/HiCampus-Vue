<template>
    <div class="edit-profile-container">
      <div class="edit-profile-header">
        <h1>编辑个人信息</h1>
        <a href="#profile" class="back-btn">返回</a>
      </div>
      
      <div class="edit-profile-content">
        <div class="avatar-section">
          <div class="avatar-container">
            <img :src="avatarUrl" class="profile-edit-avatar" alt="头像">
            <button class="edit-avatar-btn" @click="handleAvatarClick">
              <img src="/assets/images/编辑.svg" alt="编辑" class="edit-icon">
            </button>
            <input
              type="file"
              ref="avatarInput"
              accept="image/*"
              style="display: none"
              @change="handleAvatarChange"
            >
          </div>
          <p class="avatar-tip">点击编辑按钮更换头像</p>
        </div>

        <div class="form-section">
          <div class="form-group">
            <label>昵称</label>
            <input 
              type="text" 
              class="form-input nickname" 
              v-model="formData.nickname"
              placeholder="请输入昵称" 
              maxlength="6"
            >
          </div>

          <div class="form-group">
            <label>年龄</label>
            <input 
              type="text" 
              class="form-input age" 
              v-model="formData.age"
              placeholder="请输入年龄" 
              maxlength="2"
            >
          </div>

          <div class="form-group">
            <label>性别</label>
            <div class="gender-options">
              <label class="gender-option">
                <input 
                  type="radio" 
                  name="gender" 
                  value="male"
                  v-model="formData.gender"
                >
                <span>男</span>
              </label>
              <label class="gender-option">
                <input 
                  type="radio" 
                  name="gender" 
                  value="female"
                  v-model="formData.gender"
                >
                <span>女</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>修改密码</label>
            <input 
              type="password" 
              class="form-input" 
              v-model="formData.newPassword"
              placeholder="请输入新密码"
            >
          </div>

          <div class="form-group">
            <label>确认密码</label>
            <input 
              type="password" 
              class="form-input" 
              v-model="formData.confirmPassword"
              placeholder="请再次输入新密码"
            >
          </div>

          <div class="form-actions">
            <button class="cancel-btn" @click="handleCancel">取消</button>
            <button class="save-btn" @click="handleSave">保存</button>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { useEditProfile } from '../scripts/edit-profile'

const {
  avatarUrl,
  avatarInput,
  formData,
  handleAvatarClick,
  handleAvatarChange,
  handleCancel,
  handleSave
} = useEditProfile()
</script>

<style scoped>
@import '../styles/edit-profile.css';
</style> 