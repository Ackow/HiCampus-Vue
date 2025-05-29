<template>
  <div class="sidebar" id="sidebar">
    <div class="sidebar-menu">
      <a href="/" :class="{ select: currentRoute === '/' }" @click.prevent="router.push('/')">首页</a>
      <a href="/publish" :class="{ select: currentRoute === '/publish' }" @click.prevent="router.push('/publish')">发布</a>
      <a href="/notification" :class="{ select: currentRoute === '/notification' }" @click.prevent="router.push('/notification')">消息</a>
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
</script>

<style scoped>
@import '../styles/siderbar.css';
</style>