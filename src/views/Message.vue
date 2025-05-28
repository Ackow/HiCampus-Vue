<template>
  <div class="content-container">
    <div class="content-grid">
      <div class="content-card">
        <div class="card-content">
          <h3 class="card-title">消息列表</h3>
          <div class="message-list">
            <div 
              v-for="(message, index) in messages" 
              :key="index" 
              class="message-item"
              @click="handleMessageClick(message)"
            >
              <img 
                :src="message.avatar" 
                :alt="message.username + '的头像'" 
                class="user-avatar-small"
              >
              <div class="message-content">
                <div class="message-header">
                  <span class="username">{{ message.username }}</span>
                  <span class="time">{{ message.time }}</span>
                </div>
                <p class="message-text">{{ message.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const messages = ref([
  {
    id: 1,
    username: '张三',
    avatar: '/assets/images/default-avatar.png',
    content: '你好，请问这个活动什么时候开始？',
    time: '10分钟前',
    unread: true
  },
  {
    id: 2,
    username: '李四',
    avatar: '/assets/images/default-avatar.png',
    content: '谢谢你的分享，这个信息很有用！',
    time: '30分钟前',
    unread: false
  },
  {
    id: 3,
    username: '王五',
    avatar: '/assets/images/default-avatar.png',
    content: '我们可以一起参加这个活动吗？',
    time: '1小时前',
    unread: true
  }
])

const handleMessageClick = (message) => {
  // TODO: 实现消息点击跳转到聊天页面
  console.log('点击消息:', message)
  // router.push(`/chat/${message.id}`)
}

onMounted(() => {
  // TODO: 从API获取消息列表
  console.log('加载消息列表')
})
</script>

<style scoped>
.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
}

.message-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.message-item:hover {
  background-color: #f5f5f5;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.username {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.time {
  color: #999;
  font-size: 0.875rem;
}

.message-text {
  color: #666;
  font-size: 0.9375rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-avatar-small {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

/* 未读消息样式 */
.message-item.unread {
  background-color: #f0f7ff;
}

.message-item.unread .username {
  color: #4a90e2;
}

.message-item.unread .message-text {
  color: #333;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .message-item {
    padding: 10px;
  }

  .user-avatar-small {
    width: 40px;
    height: 40px;
  }

  .username {
    font-size: 0.9375rem;
  }

  .message-text {
    font-size: 0.875rem;
  }
}
</style>
