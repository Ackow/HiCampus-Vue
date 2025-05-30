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
      <div class="note-card" v-for="note in getNotesByTab" :key="note._id" @click="showPostDetail(note)">
        <img :src="getImageUrl(note)" 
             :alt="note.title" 
             class="note-img" 
             v-if="hasImages(note)"
             @error="handleImageError">
        <div class="note-title">{{ note.title }}</div>
        <div class="note-meta">
          <span class="note-like">
            <img :src="note.isLiked ? '/assets/images/爱心-红.svg' : '/assets/images/爱心.svg'" 
                 :alt="note.isLiked ? '已点赞' : '未点赞'" 
                 class="note-like-icon"
                 :class="{ 'liked': note.isLiked }">
            {{ note.likeCount || 0 }}
          </span>
          <span class="note-comment">
            <img src="/assets/images/评论.svg" alt="评论" class="note-comment-icon">
            {{ note.commentCount || 0 }}
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
    @update-like-count="handleLikeUpdate"
    @update-collect-count="handleCollectUpdate"
  />
</template>

<script setup>
import { useProfileData } from '../utils/useProfileData.js'
import { ref, onMounted, onUnmounted, watch } from 'vue'
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
  isLoading,
  error,
  initData,
  handleTabChange,
  fetchUserFavorites
} = useProfileData()

// PostDetail 相关状态
const showDetail = ref(false)
const selectedPost = ref(null)

// 检查文章是否有图片
const hasImages = (note) => {
  return note.images && Array.isArray(note.images) && note.images.length > 0;
}

// 获取图片URL
const getImageUrl = (note) => {
  if (!hasImages(note)) {
    return '';
  }
  
  const image = note.images[0];
  // console.log('处理图片数据:', image);
  
  // 如果图片是对象，尝试获取filename
  if (typeof image === 'object' && image !== null) {
    return `http://localhost:3000/uploads/images/${image.filename || image}`;
  }
  
  // 如果图片是字符串，直接使用
  if (typeof image === 'string') {
    return `http://localhost:3000/uploads/images/${image}`;
  }
  
  return '';
}

// 处理图片加载错误
const handleImageError = (event) => {
  console.error('图片加载失败:', event);
  event.target.src = '/assets/images/default-image.jpg'; // 设置默认图片
}

const showPostDetail = (post) => {
  // console.log('点击的文章数据:', post);
  if (!post) {
    console.error('文章数据为空');
    return;
  }

  if (!post.creator) {
    console.error('文章创建者信息缺失');
    return;
  }

  // 处理图片数据
  const processedImages = post.images ? post.images.map(img => {
    if (typeof img === 'object' && img !== null) {
      return `http://localhost:3000/uploads/images/${img.filename || img}`;
    }
    return `http://localhost:3000/uploads/images/${img}`;
  }) : [];

  // 处理头像数据
  const avatarUrl = post.creator.avatar 
    ? `http://localhost:3000/uploads/avatars/${post.creator.avatar}`
    : 'http://localhost:3000/uploads/avatars/default-avatar.jpg';

  selectedPost.value = {
    id: post._id,
    title: post.title,
    description: post.content,
    username: post.creator.nickname,
    avatar: avatarUrl,
    images: processedImages,
    likeCount: post.likeCount || 0,
    collectCount: post.collectCount || 0,
    commentCount: post.commentCount || 0,
    createdAt: post.createdAt,
    isLiked: post.isLiked || false,
    isCollected: post.isCollected || false,
    creatorId: post.creator._id
  }
  console.log('处理后的文章详情数据:', selectedPost.value);
  showDetail.value = true;
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

// 处理点赞更新
const handleLikeUpdate = (data) => {
  // console.log('收到点赞更新:', data);
  const { articleId, likeCount, isLiked } = data;
  
  // 更新所有相关列表中的文章数据
  [notes.value, favorites.value, likes.value].forEach(list => {
    const article = list.find(item => item._id === articleId);
    if (article) {
      article.likeCount = likeCount;
      article.isLiked = isLiked;
    }
  });
}

// 处理收藏更新
const handleCollectUpdate = (data) => {
  console.log('收到收藏更新:', data);
  const { articleId, collectCount, isCollected } = data;
  
  // 更新所有相关列表中的文章数据
  [notes.value, favorites.value, likes.value].forEach(list => {
    const article = list.find(item => item._id === articleId);
    if (article) {
      article.collectCount = collectCount;
      article.isCollected = isCollected;
      
      // 如果是取消收藏，从收藏列表中移除
      if (!isCollected && list === favorites.value) {
        const index = favorites.value.findIndex(item => item._id === articleId);
        if (index !== -1) {
          console.log('从收藏列表中移除文章:', articleId);
          favorites.value.splice(index, 1);
        }
      }
    }
  });

  // 如果当前在收藏标签页，重新获取收藏列表
  if (activeTab.value === 'favorites') {
    console.log('当前在收藏标签页，重新获取收藏列表');
    fetchUserFavorites();
  }
}

// 监听标签页变化
watch(activeTab, (newTab) => {
  console.log('标签页切换到:', newTab);
  if (newTab === 'favorites') {
    console.log('切换到收藏标签页，重新获取收藏列表');
    fetchUserFavorites();
  }
});

onMounted(() => {
  console.log('Profile组件挂载');
  window.addEventListener('userInfoUpdated', handleUserInfoUpdate);
  
  // 检查是否已登录
  if (localStorage.getItem('token')) {
    console.log('检测到登录token，开始初始化数据');
    initData();
  } else {
    console.log('未检测到登录token，请先登录');
    router.push('/login');
  }
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