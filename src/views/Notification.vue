<template>
  <div class="content-container">
    <div class="messages-main">
      <div class="message-header">
        <div class="message-title">我的消息</div>
        <div class="message-actions">
          <button 
            v-if="hasUnreadMessages" 
            class="mark-all-read-btn" 
            @click="handleMarkAllAsRead"
            :disabled="markingAllAsRead"
          >
            {{ markingAllAsRead ? '标记中...' : '全部已读' }}
          </button>
          <button 
            v-if="notifications.length > 0"
            class="delete-all-btn" 
            @click="handleDeleteAll"
            :disabled="deletingAll"
          >
            {{ deletingAll ? '删除中...' : '删除所有' }}
          </button>
        </div>
      </div>

      <div class="notifications-list">
        <div 
          class="notification-item" 
          v-for="(notification, index) in notifications" 
          :key="index"
          :class="{ 'unread': !notification.isRead }"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-left">
            <img :src="getAvatarUrl(notification.avatar)" alt="用户头像" class="user-avatar">
            <div v-if="!notification.isRead" class="unread-dot"></div>
          </div>
          <div class="notification-middle">
            <div class="notification-text">
              <span class="username">{{ notification.username }}</span>
              <span class="action-text">{{ notification.action }}</span>
            </div>
            <p v-if="notification.content" class="comment-content">{{ notification.content }}</p>
            <span class="time-ago">{{ notification.time }}</span>
          </div>
          <div class="notification-right" v-if="notification.postImage">
            <img :src="getImageUrl(notification.postImage)" alt="文章缩略图" class="post-thumbnail">
          </div>
        </div>
      </div>

      <!-- 加载更多按钮 -->
      <div v-if="hasMore" class="load-more">
        <button @click="loadMore" :disabled="loading">
          {{ loading ? '加载中...' : '加载更多' }}
        </button>
      </div>
    </div>
  </div>

  <!-- 添加文章详情组件 -->
  <PostDetail
    v-if="selectedPost"
    :show="!!selectedPost"
    :postDetail="selectedPost"
    @close="closePostDetail"
    @toggle-like="handleLikeToggle"
    @comment-added="handleCommentAdded"
    @update-like-count="handleLikeCountUpdate"
    @updateCollectCount="handleCollectCountUpdate"
  />
</template>

<script>
import axios from 'axios';
import { ref, onMounted, computed } from 'vue';
import { eventBus } from '../utils/eventBus.js';
import PostDetail from './PostDetail.vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import 'element-plus/dist/index.css';

export default {
  name: 'Notification',
  components: {
    PostDetail
  },
  setup() {
    const notifications = ref([]);
    const currentPage = ref(1);
    const hasMore = ref(true);
    const loading = ref(false);
    const markingAllAsRead = ref(false);
    const deletingAll = ref(false);
    const baseUrl = 'http://localhost:3000';
    const selectedPost = ref(null);

    // 计算是否有未读消息
    const hasUnreadMessages = computed(() => {
      return notifications.value.some(notification => !notification.isRead);
    });

    // 获取消息列表
    const fetchMessages = async (page = 1) => {
      try {
        loading.value = true;
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseUrl}/api/messages`, {
          params: {
            page,
            limit: 10
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (page === 1) {
          notifications.value = response.data.messages;
        } else {
          notifications.value = [...notifications.value, ...response.data.messages];
        }

        console.log(response.data);
        hasMore.value = page < response.data.totalPages;
        currentPage.value = page;
      } catch (error) {
        console.error('获取消息失败:', error);
      } finally {
        loading.value = false;
      }
    };

    // 处理全部已读
    const handleMarkAllAsRead = async () => {
      try {
        markingAllAsRead.value = true;
        await markAllAsRead();
        // 更新本地消息状态
        notifications.value = notifications.value.map(notification => ({
          ...notification,
          isRead: true
        }));
        // 触发未读消息数量更新事件
        eventBus.emit('updateUnreadCount', 0);
      } catch (error) {
        console.error('标记全部已读失败:', error);
      } finally {
        markingAllAsRead.value = false;
      }
    };

    // 加载更多
    const loadMore = () => {
      if (!loading.value && hasMore.value) {
        fetchMessages(currentPage.value + 1);
      }
    };

    // 获取头像URL
    const getAvatarUrl = (avatar) => {
      if (!avatar) return '/default-avatar.jpg';
      return `${baseUrl}/uploads/avatars/${avatar}`;
    };

    // 获取图片URL
    const getImageUrl = (image) => {
      if (!image) return '/default-image.jpg';
      // 如果图片URL已经包含完整路径，直接返回
      if (image.startsWith('http')) {
        return image;
      }
      // 如果图片URL包含后缀，直接拼接
      if (image.includes('.')) {
        return `${baseUrl}/uploads/images/${image}`;
      }
      // 如果图片URL不包含后缀，尝试添加常见图片后缀
      const extensions = ['.jpg', '.jpeg', '.png', '.gif'];
      for (const ext of extensions) {
        const url = `${baseUrl}/uploads/images/${image}${ext}`;
        // 这里可以添加图片存在性检查
        return url;
      }
      return '/default-image.jpg';
    };

    // 标记消息为已读
    const markAsRead = async (messageId) => {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${baseUrl}/api/messages/${messageId}/read`, null, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        // 更新本地消息状态
        notifications.value = notifications.value.map(notification => 
          notification._id === messageId ? { ...notification, isRead: true } : notification
        );
        // 触发未读消息数量更新事件
        eventBus.emit('updateUnreadCount');
      } catch (error) {
        console.error('标记已读失败:', error);
      }
    };

    // 标记所有消息为已读
    const markAllAsRead = async () => {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${baseUrl}/api/messages/read-all`, null, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('标记全部已读失败:', error);
      }
    };

    // 获取未读消息数量
    const getUnreadCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${baseUrl}/api/messages/unread-count`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        return response.data.unreadCount;
      } catch (error) {
        console.error('获取未读消息数量失败:', error);
        return 0;
      }
    };

    // 处理消息点击
    const handleNotificationClick = async (notification) => {
      try {
        // 如果消息未读，先标记为已读
        if (!notification.isRead) {
          await markAsRead(notification._id);
        }

        // 获取文章详情
        const token = localStorage.getItem('token');
        const articleId = typeof notification.article === 'object' ? notification.article._id : notification.article;
        const response = await axios.get(`${baseUrl}/api/articles/${articleId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // 设置选中的文章
        const article = response.data;
        selectedPost.value = {
          id: article._id,
          username: article.creator.nickname,
          avatar: getAvatarUrl(article.creator.avatar),
          title: article.title,
          description: article.content,
          images: article.images ? article.images.map(img => `${baseUrl}/uploads/images/${img}`) : [],
          likeCount: article.likeCount || 0,
          collectCount: article.collectCount || 0,
          commentCount: article.commentCount || 0,
          isLiked: article.isLiked || false,
          isCollected: article.isCollected || false,
          topics: article.topics || [],
          creatorId: article.creator._id,
          comments: article.comments || [],
          location: article.location || null
        };
      } catch (error) {
        console.error('获取文章详情失败:', error);
      }
    };

    // 关闭文章详情
    const closePostDetail = () => {
      selectedPost.value = null;
    };

    // 处理点赞状态变化
    const handleLikeToggle = (isLiked) => {
      if (selectedPost.value) {
        selectedPost.value.isLiked = isLiked;
      }
    };

    // 处理评论添加
    const handleCommentAdded = () => {
      // 可以在这里处理评论添加后的逻辑
    };

    // 处理点赞数更新
    const handleLikeCountUpdate = (count) => {
      if (selectedPost.value) {
        selectedPost.value.likeCount = count;
      }
    };

    // 处理收藏数更新
    const handleCollectCountUpdate = (count) => {
      if (selectedPost.value) {
        selectedPost.value.collectCount = count;
      }
    };

    // 删除所有消息
    const deleteAllMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${baseUrl}/api/messages/all`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        // 清空消息列表
        notifications.value = [];
        // 触发未读消息数量更新事件
        eventBus.emit('updateUnreadCount', 0);
        return true;
      } catch (error) {
        console.error('删除所有消息失败:', error);
        return false;
      }
    };

    // 处理删除所有消息
    const handleDeleteAll = async () => {
      try {
        deletingAll.value = true;
        const confirmed = await ElMessageBox.confirm(
          '确定要删除所有消息吗？此操作不可恢复',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );
        
        if (confirmed) {
          const success = await deleteAllMessages();
          if (success) {
            ElMessage.success('所有消息已删除');
          } else {
            ElMessage.error('删除失败，请重试');
          }
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('操作失败，请重试');
        }
      } finally {
        deletingAll.value = false;
      }
    };

    onMounted(() => {
      fetchMessages();
    });

    return {
      notifications,
      hasMore,
      loading,
      markingAllAsRead,
      deletingAll,
      hasUnreadMessages,
      loadMore,
      getAvatarUrl,
      getImageUrl,
      markAsRead,
      markAllAsRead,
      handleMarkAllAsRead,
      handleDeleteAll,
      getUnreadCount,
      selectedPost,
      handleNotificationClick,
      closePostDetail,
      handleLikeToggle,
      handleCommentAdded,
      handleLikeCountUpdate,
      handleCollectCountUpdate
    };
  }
};
</script>

<style scoped>
@import '../styles/notification.css';

.message-actions {
  display: flex;
  gap: 10px;
}

.delete-all-btn {
  background-color: #f56c6c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.delete-all-btn:hover {
  background-color: #e64242;
}

.delete-all-btn:disabled {
  background-color: #fab6b6;
  cursor: not-allowed;
}
</style> 