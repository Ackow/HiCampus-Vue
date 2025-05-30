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
        <div class="profile-meta">
          <div class="profile-meta-item">嗨号：{{ userInfo.uid }}</div>
          <div class="profile-student-id">学号：{{ userInfo.studentId || '未设置' }}</div>
        </div>
        <div class="profile-tags">
          <img :src="userInfo.gender === 'male' ? '/assets/images/男.svg' : '/assets/images/女.svg'" alt="性别" class="profile-gender">
          <span class="profile-age">{{ userInfo.age }}岁</span>
        </div>
      </div>
    </div>
    <div class="profile-tabs">
      <div class="profile-tab" :class="{ active: activeTab === 'notes' }" @click="handleTabChange('notes')">笔记</div>
      <div class="profile-tab" :class="{ active: activeTab === 'favorites' }" @click="handleTabChange('favorites')">收藏</div>
      <div class="profile-tab" :class="{ active: activeTab === 'likes' }" @click="handleTabChange('likes')">点赞</div>
    </div>
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>
    <div v-else-if="getNotesByTab.length === 0" class="empty-state">
      <p>暂无内容</p>
    </div>
    <div v-else class="note-list">
      <div class="note-card" v-for="note in getNotesByTab" :key="note.id" @click="showPostDetail(note)">
        <img :src="note.image" :alt="note.title" class="note-img" v-if="note.image">
        <div class="note-title">{{ note.title }}</div>
        <div class="note-meta">
          <span class="note-like">
            <img :src="note.isLiked ? '/assets/images/爱心-红.svg' : '/assets/images/爱心.svg'" 
                 :alt="note.isLiked ? '已点赞' : '未点赞'" 
                 class="note-like-icon"
                 :class="{ 'liked': note.isLiked }">
            {{ note.likes || 0 }}
          </span>
          <span class="note-comment">
            <img src="/assets/images/评论.svg" alt="评论" class="note-comment-icon">
            {{ note.comments || 0 }}
          </span>
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

  <PostDetail
    v-if="showDetail"
    :show="showDetail"
    :post-detail="selectedPost"
    @close="closePostDetail"
  />
</template>

<script setup>
import { useProfileData } from '../utils/useProfileData.js'
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../utils/useAuth.js'
import { useRouter } from 'vue-router'
import PostDetail from '../views/PostDetail.vue'

const router = useRouter();
const auth = useAuth();
const {
  userInfo,
  notes,
  favorites,
  likes,
  activeTab,
  getNotesByTab,
  initData,
  isLoading,
  error,
  handleTabChange
} = useProfileData()

// PostDetail 相关状态
const showDetail = ref(false)
const selectedPost = ref(null)

const showPostDetail = (post) => {
  selectedPost.value = {
    id: post.id,
    title: post.title,
    description: post.content,
    username: post.authorName,
    avatar: post.authorAvatar,
    images: post.image ? [post.image] : [],
    likeCount: post.likes,
    collectCount: 0,
    commentCount: post.comments,
    createdAt: post.createdAt
  }
  showDetail.value = true
}

const closePostDetail = () => {
  showDetail.value = false
  selectedPost.value = null
}

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
  initData();
})

onUnmounted(() => {
  window.removeEventListener('userInfoUpdated', handleUserInfoUpdate)
})

defineExpose({ initData })
</script>

<style scoped>
@import '../styles/profile.css';

.note-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.note-card:hover {
  transform: scale(1.02);
}
</style>