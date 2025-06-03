<template>
  <div class="sidebar" id="sidebar">
    <div class="sidebar-menu">
      <a href="/" :class="{ select: currentRoute === '/' }" @click.prevent="router.push('/')">首页</a>
      <a 
        href="/publish" 
        :class="{ select: currentRoute === '/publish' }" 
        @click.prevent="handlePublishClick"
      >发布</a>
      <a 
        href="/notification" 
        :class="{ select: currentRoute === '/notification' }" 
        @click.prevent="handleNotificationClick"
      >
        消息
        <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
      </a>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, watch, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { eventBus } from '../utils/eventBus.js'

const router = useRouter()
const route = useRoute()
const currentRoute = ref(route.path)
const unreadCount = ref(0)
const baseUrl = 'http://116.198.43.27:3000'
let pollInterval = null

// 获取未读消息数量
const fetchUnreadCount = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const response = await axios.get(`${baseUrl}/api/messages/unread-count`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    unreadCount.value = response.data.unreadCount
  } catch (error) {
    console.error('获取未读消息数量失败:', error)
  }
}

// 开始轮询未读消息数量
const startPolling = () => {
  // 立即获取一次
  fetchUnreadCount()
  // 每30秒更新一次
  pollInterval = setInterval(fetchUnreadCount, 30000)
}

// 停止轮询
const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    currentRoute.value = newPath
  }
)

// 检查登录状态
const checkLogin = () => {
  try {
    const token = localStorage?.getItem('token')
    if (!token) {
      window.alert('请先登录')
      return false
    }
    return true
  } catch (error) {
    console.error('检查登录状态失败:', error)
    window.alert('请先登录')
    return false
  }
}

// 处理发布按钮点击
const handlePublishClick = () => {
  if (checkLogin()) {
    router.push('/publish')
  }
}

// 处理消息按钮点击
const handleNotificationClick = () => {
  if (checkLogin()) {
    router.push('/notification')
  }
}

// 监听未读消息数量更新事件
const handleUnreadCountUpdate = (count) => {
  if (typeof count === 'number') {
    unreadCount.value = count
  } else {
    fetchUnreadCount()
  }
}

onMounted(() => {
  if (checkLogin()) {
    startPolling()
    // 添加事件监听
    eventBus.on('updateUnreadCount', handleUnreadCountUpdate)
  }
})

onUnmounted(() => {
  stopPolling()
  // 移除事件监听
  eventBus.off('updateUnreadCount', handleUnreadCountUpdate)
})
</script>

<style scoped>
@import '../styles/siderbar.css';

.unread-badge {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #ff4d4f;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 12px;
  min-width: 20px;
  text-align: center;
  line-height: 1.2;
}

.sidebar-menu a {
  position: relative;
}
</style>