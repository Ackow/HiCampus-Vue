<script setup>
import Header from '../components/Header.vue'
import Sidebar from '../components/Sidebar.vue'
import Profile from '../components/Profile.vue'
import { ref, onMounted } from 'vue'

const showProfile = ref(false)
const profileRef = ref(null)

const openProfile = () => {
  showProfile.value = true
  profileRef.value?.initData?.()
}

onMounted(() => {
  // 页面加载时，如果 hash 是 #profile，直接打开并初始化
  if (window.location.hash === '#profile') {
    openProfile()
  }

  // 监听 hash 变化，也能触发
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#profile') {
      openProfile()
    }
  })
})
</script>

<template>
  <div>
    <Header @init-profile="openProfile" />
    <div class="main-container">
      <Sidebar />
      <div class="content-area">
        <!-- 这里可以添加更多内容 -->
        <Profile v-if="showProfile" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  display: flex;
  max-width: 2000px;
  min-width: 800px;
  margin: 0 auto;
}

.content-area {
  flex: 1; /* 让内容区占据剩余空间 */
  padding: 20px;
  margin-top: 80px;
  margin-left: 300px;
}
</style>