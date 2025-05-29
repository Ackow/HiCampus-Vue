<template>
  <div class="content-container">
    <div class="messages-main">
      <div class="message-title">赞和评论</div>

      <div class="notifications-list">
        <div class="notification-item" v-for="(notification, index) in notifications" :key="index">
          <div class="notification-left">
            <img :src="notification.avatar" alt="User Avatar" class="user-avatar">
          </div>
          <div class="notification-middle">
            <div class="notification-text">
              <span class="username">{{ notification.username }}</span>
              <span class="action-text">{{ notification.action }}</span>
            </div>
            <p v-if="notification.comment" class="comment-content">{{ notification.comment }}</p>
            <div v-if="notification.comment" class="comment-actions">
              <button class="action-btn like-btn" @click="handleLike(index)">
                <i :class="notification.liked ? 'fas fa-heart' : 'far fa-heart'"></i> 赞
              </button>
              <button class="action-btn reply-btn" @click="handleReply(index)">
                <i class="fas fa-reply"></i> 回复
              </button>
            </div>
            <span class="time-ago">{{ notification.time }}</span>
          </div>
          <div class="notification-right">
            <img :src="notification.postImage" alt="Post Thumbnail" class="post-thumbnail">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Notification',
  data() {
    return {
      notifications: [
        {
          username: 'weysx',
          action: '赞了你的帖子。',
          avatar: 'https://via.placeholder.com/40x40',
          postImage: 'https://via.placeholder.com/60x60',
          time: '三天前',
          liked: false
        },
        {
          username: 'Ackow',
          action: '赞了你的帖子。',
          avatar: 'https://via.placeholder.com/40x40',
          postImage: 'https://via.placeholder.com/60x60',
          time: '三天前',
          liked: false
        },
        {
          username: 'Ackow',
          action: '评论了你的帖子。',
          comment: '是呀是呀！',
          avatar: 'https://via.placeholder.com/40x40',
          postImage: 'https://via.placeholder.com/60x60',
          time: '三天前',
          liked: false
        },
        {
          username: 'yeeeee',
          action: '赞了你的帖子。',
          avatar: 'https://via.placeholder.com/40x40',
          postImage: 'https://via.placeholder.com/60x60',
          time: '04-15',
          liked: false
        },
        {
          username: 'yeeeee',
          action: '评论了你的帖子。',
          comment: '没错',
          avatar: 'https://via.placeholder.com/40x40',
          postImage: 'https://via.placeholder.com/60x60',
          time: '04-15',
          liked: false
        }
      ]
    }
  },
  methods: {
    handleLike(index) {
      this.notifications[index].liked = !this.notifications[index].liked;
    },
    handleReply(index) {
      // 实现回复功能
      console.log('回复评论:', index);
    }
  }
}
</script>

<style scoped>
@import '../styles/notification.css';
</style> 