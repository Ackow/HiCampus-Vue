<template>
  <div class="profile-container" v-if="userInfo">
    <div class="profile-header">
      <div class="profile-left">
        <div class="avatar-container">
          <img class="profile-avatar" :src="userInfo.avatar || 'http://localhost:3000/uploads/avatars/default-avatar.jpg'" alt="头像">
        </div>
      </div>
      <div class="profile-right">
        <div class="profile-nickname-container">
          <div class="profile-nickname">{{ userInfo.nickname || userInfo.username }}</div>
          <a class="edit-nickname-btn" @click="handleEditClick">
            <img src="/assets/images/编辑.svg" alt="编辑" class="edit-icon">
          </a>
        </div>
        <div class="profile-meta">嗨号：<span class="profile-uid">{{ userInfo.uid }}</span></div>
        <div class="profile-tags">
          <img :src="userInfo.gender === 'male' ? '/assets/images/男.svg' : '/assets/images/女.svg'" alt="性别" class="profile-gender">
          <span class="profile-age">{{ userInfo.age }}岁</span>
        </div>
      </div>
    </div>
    <div class="profile-tabs">
      <div class="profile-tab" :class="{ active: activeTab === 'notes' }" @click="activeTab = 'notes'">笔记</div>
      <div class="profile-tab" :class="{ active: activeTab === 'favorites' }" @click="activeTab = 'favorites'">收藏</div>
      <div class="profile-tab" :class="{ active: activeTab === 'likes' }" @click="activeTab = 'likes'">点赞</div>
    </div>
    <div class="note-list">
      <div v-for="note in getNotesByTab" :key="note.id" class="note-card">
        <img class="note-img" :src="note.image" :alt="note.title">
        <div class="note-title">{{ note.title }}</div>
        <div class="note-meta">
          <img :src="note.authorAvatar" alt="用户头像">
          {{ note.authorName }}
          <span class="note-like"><i>❤</i>{{ note.likes }}</span>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="profile-container">
    <div class="profile-header">
      <div class="profile-message">
        请先登录以查看个人信息
      </div>
    </div>
  </div>
</template>

<script setup>
import { useProfileData } from '../utils/useProfileData.js'
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../utils/useAuth.js'
import { useRouter } from 'vue-router'

const router = useRouter();
const auth = useAuth();
const {
  userInfo,
  notes,
  favorites,
  likes,
  activeTab,
  getNotesByTab,
  initData
} = useProfileData()

const handleUserInfoUpdate = (event) => {
  console.log('Profile: 收到用户信息更新事件', event.detail);
  userInfo.value = event.detail;
}

const handleEditClick = () => {
  router.push({ name: 'EditProfile' });
}

onMounted(() => {
  console.log('Profile组件挂载');
  window.addEventListener('userInfoUpdated', handleUserInfoUpdate);
  // 确保组件挂载时初始化数据
  initData();
})

onUnmounted(() => {
  window.removeEventListener('userInfoUpdated', handleUserInfoUpdate)
})

// 暴露给父组件调用
import { defineExpose } from 'vue'
defineExpose({ initData })
</script>

<style scoped>
@import '../styles/profile.css';

.profile-message {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
  color: #666;
}
</style>