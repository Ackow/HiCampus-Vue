<template>
    <div class="edit-profile-container">
      <div class="edit-profile-header">
        <h1>编辑个人信息</h1>
        <a href="#profile" class="back-btn">返回</a>
      </div>
      
      <div class="edit-profile-content" v-loading="isLoading">
        <div class="avatar-section">
          <div class="avatar-container">
            <img :src="avatarUrl" class="profile-edit-avatar" alt="头像">
            <button class="edit-avatar-btn" @click="handleAvatarClick" :disabled="isLoading">
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
              :disabled="isLoading"
            >
          </div>

          <div class="form-group">
            <label>学号</label>
            <input 
              type="text" 
              class="form-input student-id" 
              v-model="formData.studentId"
              placeholder="请输入学号（选填）" 
              maxlength="8"
              :disabled="isLoading"
            >
          </div>

          <div class="form-group">
            <label>学院</label>
            <select 
              class="form-input college" 
              v-model="formData.college"
              :disabled="isLoading"
            >
              <option value="">请选择学院</option>
              <option v-for="college in collegeOptions" :key="college" :value="college">
                {{ college }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>年龄</label>
            <input 
              type="text" 
              class="form-input age" 
              v-model="formData.age"
              placeholder="请输入年龄" 
              maxlength="2"
              :disabled="isLoading"
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
                  :disabled="isLoading"
                >
                <span>男</span>
              </label>
              <label class="gender-option">
                <input 
                  type="radio" 
                  name="gender" 
                  value="female"
                  v-model="formData.gender"
                  :disabled="isLoading"
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
              :disabled="isLoading"
            >
          </div>

          <div class="form-group">
            <label>确认密码</label>
            <input 
              type="password" 
              class="form-input" 
              v-model="formData.confirmPassword"
              placeholder="请再次输入新密码"
              :disabled="isLoading"
            >
          </div>

          <div class="form-actions">
            <button class="cancel-btn" @click="handleCancel" :disabled="isLoading">取消</button>
            <button class="save-btn" @click="handleSave" :disabled="isLoading">保存</button>
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
  isLoading,
  collegeOptions,
  handleAvatarClick,
  handleAvatarChange,
  handleCancel,
  handleSave
} = useEditProfile()
</script>

<style scoped>
@import '../styles/edit-profile.css';

/* 添加下拉框样式 */
select.form-input {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
  padding-right: 2.5rem;
}

select.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}
</style> 