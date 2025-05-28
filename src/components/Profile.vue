<template>
  <div class="profile-container">
      <div class="profile-header">
        <div class="profile-left">
          <div class="avatar-container">
            <img class="profile-avatar" :src="userInfo.avatar" alt="头像">
          </div>
        </div>
        <div class="profile-right">
          <div class="profile-nickname-container">
            <div class="profile-nickname">{{ userInfo.nickname }}</div>
            <a href="#edit-profile" class="edit-nickname-btn">
              <img src="/assets/images/编辑.svg" alt="编辑" class="edit-icon">
            </a>
          </div>
          <div class="profile-meta">嗨号：<span class="profile-uid">{{ userInfo.uid }}</span></div>
          <div class="profile-tags"><img src="/assets/images/男.svg" alt="性别" class="profile-gender"><span class="profile-age">{{ userInfo.age }}岁</span></div>
        </div>
      </div>
      <div class="profile-tabs">
        <div class="profile-tab" :class="{ active: activeTab === 'notes' }" @click="activeTab = 'notes'">笔记</div>
        <div class="profile-tab" :class="{ active: activeTab === 'favorites' }" @click="activeTab = 'favorites'">收藏</div>
        <div class="profile-tab" :class="{ active: activeTab === 'likes' }" @click="activeTab = 'likes'">点赞</div>
      </div>
      <div class="note-list">
        <div v-for="note in getNotesByTab" :key="note.id" class="note-card">
          <img class="note-img" :src="note.image" alt="{{ note.title }}">
          <div class="note-title">{{ note.title }}</div>
          <div class="note-meta">
            <img :src="note.authorAvatar" alt="用户头像">
            {{ note.authorName }}
            <span class="note-like"><i>❤</i>{{ note.likes }}</span>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
  import { useProfileData } from '../utils/useProfileData.js'

  // 调用自定义组合函数
  const {
    userInfo,
    notes,
    favorites,
    likes,
    activeTab,
    getNotesByTab,
    initData
  } = useProfileData()

  // 暴露给父组件调用
  import { defineExpose } from 'vue'
  defineExpose({ initData })
</script>

<style scoped>
  @import '../styles/profile.css';
</style>