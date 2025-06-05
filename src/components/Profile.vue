<template>
  <div>
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
            <a class="edit-nickname-btn" @click="handleEditClick" v-if="isCurrentUser">
              <img src="/assets/images/编辑.svg" alt="编辑" class="edit-icon">
            </a>
            <button 
              v-if="!isCurrentUser" 
              class="follow-btn" 
              :class="{ 'following': userInfo.isFollowing }"
              @click="handleFollow"
            >
              {{ userInfo.isFollowing ? '已关注' : '关注' }}
            </button>
          </div>
          <div class="profile-meta">
            <div class="profile-meta-item">嗨号：{{ userInfo.uid }}</div>
            <div class="profile-meta-item">学号：{{ userInfo.studentId || '未设置' }}</div>
            <div class="profile-meta-item">学院：{{ userInfo.college || '未设置' }}</div>
          </div>
          <div class="profile-tags">
            <img :src="userInfo.gender === 'male' ? './assets/images/男.svg' : './assets/images/女.svg'" alt="性别" class="profile-gender">
            <span class="profile-age">{{ userInfo.age }}岁</span>
          </div>
          <div class="profile-stats">
            <span class="stat-item" @click="handleFollowingClick">
              <span class="stat-label">关注</span>
              <span class="stat-value">{{ userInfo.followingCount || 0 }}</span>
            </span>
            <span class="stat-item" @click="handleFollowersClick">
              <span class="stat-label">粉丝</span>
              <span class="stat-value">{{ userInfo.followerCount || 0 }}</span>
            </span>
          </div>
        </div>
      </div>
      <div class="profile-tabs" v-if="isCurrentUser">
        <div class="profile-tab" :class="{ active: activeTab === 'notes' }" @click="handleTabChange('notes')">笔记</div>
        <div class="profile-tab" :class="{ active: activeTab === 'favorites' }" @click="handleTabChange('favorites')">收藏</div>
        <div class="profile-tab" :class="{ active: activeTab === 'likes' }" @click="handleTabChange('likes')">点赞</div>
      </div>
      <div v-else class="profile-tabs">
        <div class="profile-tab active">笔记</div>
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
              <img :src="note.isLiked ? './assets/images/爱心-红.svg' : './assets/images/爱心.svg'" 
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

    <!-- 添加关注列表对话框 -->
    <el-dialog
      v-model="showFollowingList"
      title="关注列表"
      width="30%"
      :before-close="() => showFollowingList = false"
    >
      <div class="user-list">
        <div v-if="followingList.length === 0" class="empty-list">
          暂无关注
        </div>
        <div v-else class="user-item" v-for="user in followingList" :key="user._id">
          <div class="user-info" @click="navigateToUserProfile(user._id)">
            <img :src="user.avatar" 
                 :alt="user.nickname" 
                 class="user-avatar">
            <span class="user-nickname">{{ user.nickname }}</span>
          </div>
          <button 
            v-if="user._id !== uid"
            class="list-follow-btn" 
            :class="{ 'following': user.isFollowing }"
            @click.stop="handleListFollow(user)"
          >
            {{ user.isFollowing ? '已关注' : '关注' }}
          </button>
        </div>
      </div>
    </el-dialog>

    <!-- 添加粉丝列表对话框 -->
    <el-dialog
      v-model="showFollowersList"
      title="粉丝列表"
      width="30%"
      :before-close="() => showFollowersList = false"
    >
      <div class="user-list">
        <div v-if="followersList.length === 0" class="empty-list">
          暂无粉丝
        </div>
        <div v-else class="user-item" v-for="user in followersList" :key="user._id">
          <div class="user-info" @click="navigateToUserProfile(user._id)">
            <img :src="user.avatar" 
                 :alt="user.nickname" 
                 class="user-avatar">
            <span class="user-nickname">{{ user.nickname }}</span>
          </div>
          <button 
            v-if="user._id !== uid"
            class="list-follow-btn" 
            :class="{ 'following': user.isFollowing }"
            @click.stop="handleListFollow(user)"
          >
            {{ user.isFollowing ? '已关注' : '关注' }}
          </button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { useProfileData } from '../utils/useProfileData.js'
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useAuth } from '../utils/useAuth.js'
import { useRouter, useRoute } from 'vue-router'
import PostDetail from '../views/PostDetail.vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter();
const route = useRoute();
const auth = useAuth();
const uid = localStorage.getItem('uid');

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
  fetchUserInfo,
  fetchUserFavorites,
  fetchUserNotes,
  fetchUserLikes,
  handleLikeUpdate,
  handleCollectUpdate,
  followUser,
  unfollowUser
} = useProfileData()

// PostDetail 相关状态
const showDetail = ref(false)
const selectedPost = ref(null)

// 添加关注和粉丝列表的状态
const showFollowingList = ref(false)
const showFollowersList = ref(false)
const followingList = ref([])
const followersList = ref([])

// 检查文章是否有图片
const hasImages = (note) => {
  return note.images && Array.isArray(note.images) && note.images.length > 0;
}

// 获取图片URL
const getImageUrl = (note) => {
  if (note.video && note.video.thumbnail) {
    return note.video.thumbnail;
  }

  // 最后使用图片
  if (note.images && note.images.length > 0) {
    const imagePath = note.images[0];
    // 如果已经是完整URL，直接返回
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // 如果是相对路径，添加服务器地址
    return `http://localhost:3000/uploads/images/${imagePath}`;
  }
  return null;
}

// 处理图片加载错误
const handleImageError = (event) => {
  console.error('图片加载失败:', event);
  event.target.src = '/assets/images/default-image.jpg'; // 设置默认图片
}

const showPostDetail = (post) => {
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

  // 确保点赞状态正确
  const isLiked = post.isLiked || (post.likedBy && post.likedBy.includes(auth.user?._id));

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
    isLiked: isLiked,
    isCollected: post.isCollected || false,
    creatorId: post.creator._id,
    location: post.location || null,
    video: post.video || null
  }
  showDetail.value = true;
}

const closePostDetail = () => {
  showDetail.value = false
  selectedPost.value = null
}

const handleUserInfoUpdate = (event) => {
  console.log('Profile: 收到用户信息更新事件', event.detail);
  if (event.detail && event.detail.id) {
    // 如果收到的是用户ID，重新加载用户数据
    loadUserData();
  }
};

const handleEditClick = () => {
  router.push({ name: 'EditProfile' });
}

// 处理关注/取消关注
const handleFollow = async () => {
  if (!auth.isAuthenticated()) {
    ElMessage.warning('请先登录');
    return;
  }

  try {
    const userId = route.params.userId;
    if (!userId) return;

    if (userInfo.value.isFollowing) {
      const result = await unfollowUser(userId);
      if (result) {
        userInfo.value.isFollowing = false;
        userInfo.value.followerCount = result.followerCount;
        // 更新当前用户的关注数
        const currentUser = auth.getUserInfo();
        if (currentUser) {
          currentUser.followingCount = (currentUser.followingCount || 0) - 1;
          auth.updateUserInfo(currentUser);
        }
      }
      ElMessage.success('已取消关注');
    } else {
      const result = await followUser(userId);
      if (result) {
        userInfo.value.isFollowing = true;
        userInfo.value.followerCount = result.followerCount;
        // 更新当前用户的关注数
        const currentUser = auth.getUserInfo();
        if (currentUser) {
          currentUser.followingCount = (currentUser.followingCount || 0) + 1;
          auth.updateUserInfo(currentUser);
        }
      }
      ElMessage.success('关注成功');
    }
  } catch (error) {
    console.error('关注操作失败:', error);
    ElMessage.error('操作失败，请稍后重试');
  }
};

// 获取关注列表
const fetchFollowingList = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/user/${userId}/following`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      followingList.value = data.following.map(user => ({
        ...user,
        _id: user.id || user._id,
        isFollowing: true
      }));
      // 更新关注数
      if (userInfo.value) {
        userInfo.value.followingCount = data.followingCount;
        console.log('更新关注数:', data.followingCount);
      }
    }
  } catch (error) {
    console.error('获取关注列表失败:', error);
    ElMessage.error('获取关注列表失败');
  }
};

// 获取粉丝列表
const fetchFollowersList = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/user/${userId}/followers`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      followersList.value = data.followers.map(user => ({
        ...user,
        _id: user.id || user._id,
        isFollowing: user.isFollowing || false
      }));
      // 更新粉丝数
      if (userInfo.value) {
        userInfo.value.followerCount = data.followerCount;
        console.log('更新粉丝数:', data.followerCount);
      }
    }
  } catch (error) {
    console.error('获取粉丝列表失败:', error);
    ElMessage.error('获取粉丝列表失败');
  }
};

// 处理点击关注数
const handleFollowingClick = async () => {
  const userId = route.params.userId || userInfo.value?._id;
  if (userId !== uid) return;
  
  await fetchFollowingList(uid);
  showFollowingList.value = true;
};

// 处理点击粉丝数
const handleFollowersClick = async () => {
  const userId = route.params.userId || userInfo.value?._id;
  if (userId !== uid) return;
  
  await fetchFollowersList(uid);
  showFollowersList.value = true;
};

// 监听标签页变化
watch(activeTab, async (newTab) => {
  try {
    isLoading.value = true;
    switch (newTab) {
      case 'notes':
        await fetchUserNotes();
        break;
      case 'favorites':
        await fetchUserFavorites();
        break;
      case 'likes':
        await fetchUserLikes();
        break;
    }
  } catch (error) {
    console.error('加载数据失败:', error);
    error.value = '加载数据失败';
  } finally {
    isLoading.value = false;
  }
});

  // 修改 isCurrentUser 计算属性
  const isCurrentUser = computed(() => {
  const currentUser = auth.getUserInfo();
  const viewedUserId = route.params.userId;
  return !viewedUserId || currentUser?._id === viewedUserId;
});

// 加载用户数据
const loadUserData = async () => {
  try {
    isLoading.value = true;
    const userId = route.params.userId;
    
    if (userId) {
      // 查看其他用户的个人主页
      const user = await fetchUserInfo(userId);
      if (user) {
        await fetchUserNotes(userId);
        // 获取关注和粉丝数量
        await fetchFollowingList(userId);
        await fetchFollowersList(userId);
      } else {
        error.value = '获取用户信息失败';
      }
    } else {
      // 查看自己的个人主页
      await initData();
      
      // 获取关注和粉丝数量
      const currentUserId = localStorage.getItem('uid');
      if (currentUserId) {
        await fetchFollowingList(currentUserId);
        await fetchFollowersList(currentUserId);
      }
      
      // 根据当前标签页加载相应数据
      switch (activeTab.value) {
        case 'notes':
          await fetchUserNotes();
          break;
        case 'favorites':
          await fetchUserFavorites();
          break;
        case 'likes':
          await fetchUserLikes();
          break;
      }
    }
  } catch (error) {
    console.error('加载用户数据失败:', error);
    error.value = '加载用户数据失败';
  } finally {
    isLoading.value = false;
  }
};

// 监听路由参数变化
watch(() => route.params.userId, async (newUserId, oldUserId) => {
  if (newUserId !== oldUserId) {
    // 重置状态
    userInfo.value = null;
    notes.value = [];
    favorites.value = [];
    likes.value = [];
    error.value = null;
    
    // 重新加载数据
    await loadUserData();
  }
}, { immediate: true });

onMounted(async () => {
  console.log('Profile组件挂载');
  window.addEventListener('userInfoUpdated', handleUserInfoUpdate);
  
  // 检查是否已登录
  if (!localStorage.getItem('token')) {
    console.log('未检测到登录token，请先登录');
    router.push('/register-login');
    return;
  }

  // 立即加载用户数据
  await loadUserData();
});

onUnmounted(() => {
  window.removeEventListener('userInfoUpdated', handleUserInfoUpdate);
});

defineExpose({ initData })

// 在 script setup 部分添加处理函数
const handleListFollow = async (user) => {
  if (!auth.isAuthenticated()) {
    ElMessage.warning('请先登录');
    return;
  }

  // 检查用户ID是否存在，同时支持id和_id字段
  const targetUserId = user?.id || user?._id;
  if (!targetUserId) {
    console.error('用户ID不存在:', user);
    ElMessage.error('操作失败：用户信息不完整');
    return;
  }

  try {
    if (user.isFollowing) {
      const result = await unfollowUser(targetUserId);
      if (result) {
        user.isFollowing = false;
        // 更新粉丝数
        if (userInfo.value) {
          userInfo.value.followerCount = result.followerCount;
        }
        // 更新当前用户的关注数
        const currentUser = auth.getUserInfo();
        if (currentUser) {
          currentUser.followingCount = (currentUser.followingCount || 0) - 1;
          auth.updateUserInfo(currentUser);
        }
      }
      ElMessage.success('已取消关注');
    } else {
      const result = await followUser(targetUserId);
      if (result) {
        user.isFollowing = true;
        // 更新粉丝数
        if (userInfo.value) {
          userInfo.value.followerCount = result.followerCount;
        }
        // 更新当前用户的关注数
        const currentUser = auth.getUserInfo();
        if (currentUser) {
          currentUser.followingCount = (currentUser.followingCount || 0) + 1;
          auth.updateUserInfo(currentUser);
        }
      }
      ElMessage.success('关注成功');
    }
  } catch (error) {
    console.error('关注操作失败:', error);
    ElMessage.error('操作失败，请稍后重试');
  }
};

// 在 script setup 部分添加导航函数
const navigateToUserProfile = (userId) => {
  router.push(`/profile/${userId}`);
  showFollowingList.value = false;
  showFollowersList.value = false;
};
</script>

<style scoped>
@import '../styles/profile.css';

.profile-stats {
  display: flex;
  gap: 20px;
  margin-top: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.stat-value {
  font-weight: 600;
  color: #555;
  font-size: 1.2rem;
}

.stat-label {
  color: #666;
  font-size: 1.2rem;
}

.profile-nickname-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.follow-btn {
  padding: 6px 16px;
  border-radius: 20px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #1890ff;
  color: white;
  margin-left: 10px;
}

.follow-btn.following {
  background-color: #f0f0f0;
  color: #666;
}

.follow-btn:hover {
  opacity: 0.8;
}

.follow-btn.following:hover {
  background-color: #e0e0e0;
}

.user-list {
  max-height: 400px;
  overflow-y: auto;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.user-item:last-child {
  border-bottom: none;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.user-nickname {
  font-size: 14px;
  color: #333;
}

.empty-list {
  text-align: center;
  color: #999;
  padding: 20px;
}

.list-follow-btn {
  margin-left: auto;
  padding: 4px 12px;
  border-radius: 16px;
  border: none;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #1890ff;
  color: white;
}

.list-follow-btn.following {
  background-color: #f0f0f0;
  color: #666;
}

.list-follow-btn:hover {
  opacity: 0.8;
}

.list-follow-btn.following:hover {
  background-color: #e0e0e0;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  flex: 1;
}

.user-info:hover {
  opacity: 0.8;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
  gap: 10px;
}
</style>