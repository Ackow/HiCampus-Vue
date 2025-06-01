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
      >消息</a>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, watch } from 'vue'

const router = useRouter()
const route = useRoute()
const currentRoute = ref(route.path)

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
    const token = localStorage?.getItem('token');
    if (!token) {
      window.alert('请先登录');
      return false;
    }
    return true;
  } catch (error) {
    console.error('检查登录状态失败:', error);
    window.alert('请先登录');
    return false;
  }
}

// 处理发布按钮点击
const handlePublishClick = () => {
  if (checkLogin()) {
    router.push('/publish');
  }
}

// 处理消息按钮点击
const handleNotificationClick = () => {
  if (checkLogin()) {
    router.push('/notification');
  }
}
</script>

<style scoped>
@import '../styles/siderbar.css';
</style>