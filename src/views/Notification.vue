<template>
  <div class="content-container">
    <div class="messages-main">
      <div class="message-title">我的消息</div>

      <div class="notifications-list">
        <div class="notification-item" v-for="(notification, index) in notifications" :key="index">
          <div class="notification-left">
            <img :src="getAvatarUrl(notification.avatar)" alt="用户头像" class="user-avatar">
          </div>
          <div class="notification-middle">
            <div class="notification-text">
              <span class="username">{{ notification.username }}</span>
              <span class="action-text">{{ notification.action }}</span>
            </div>
            <p v-if="notification.content" class="comment-content">{{ notification.content }}</p>
            <span class="time-ago">{{ notification.time }}</span>
          </div>
          <div class="notification-right">
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
</template>

<script>
import axios from 'axios';
import { ref, onMounted } from 'vue';

export default {
  name: 'Notification',
  setup() {
    const notifications = ref([]);
    const currentPage = ref(1);
    const hasMore = ref(true);
    const loading = ref(false);
    const baseUrl = 'http://localhost:3000';

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

    onMounted(() => {
      fetchMessages();
    });

    return {
      notifications,
      hasMore,
      loading,
      loadMore,
      getAvatarUrl,
      getImageUrl,
      markAsRead,
      markAllAsRead,
      getUnreadCount
    };
  }
};
</script>

<style scoped>
@import '../styles/notification.css';

.load-more {
  text-align: center;
  margin-top: 20px;
  padding: 10px;
}

.load-more button {
  background-color: #f0f2f5;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
}

.load-more button:hover {
  background-color: #e4e6eb;
}

.load-more button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
</style> 