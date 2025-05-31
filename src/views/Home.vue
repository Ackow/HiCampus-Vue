<script setup>
import Header from '../components/Header.vue'
import Sidebar from '../components/Sidebar.vue'
import Profile from '../components/Profile.vue'
import EditProfile from '../components/EditProfile.vue'
import ArticleList from '../components/ArticleList.vue'
import { ref, onMounted, computed, watch, nextTick, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()

// 计算sidebar的偏移量
const mainContainerWidth = ref(0)
const sidebarTransform = computed(() => {
  const offset = mainContainerWidth.value * -0.5
  return `translateX(${Math.min(-400, Math.max(-1000, offset))}px)`
})

const showSidebar = computed(() => {
  return route.meta.showSidebar !== false;
})

const showProfile = ref(false)
const showEditProfile = ref(false)
const profileRef = ref(null)

const openProfile = () => {
  showProfile.value = true
  profileRef.value?.initData?.()
}

// 监听路由变化
watch(() => route.name, (newRouteName) => {
  console.log('路由名称变化:', newRouteName);
  if (newRouteName === 'UserProfile') {
    console.log('检测到用户主页路由，重新加载内容');
    showProfile.value = true;
    showEditProfile.value = false;
    nextTick(() => {
      profileRef.value?.initData?.();
    });
  } else if (newRouteName === 'Profile') {
    showProfile.value = true;
    showEditProfile.value = false;
    nextTick(() => {
      profileRef.value?.initData?.();
    });
  } else if (newRouteName === 'EditProfile') {
    showProfile.value = false;
    showEditProfile.value = true;
  } else if (newRouteName === 'Home' || newRouteName === 'Notification') {
    showProfile.value = false;
    showEditProfile.value = false;
  }
});

const updateMainContainerWidth = () => {
  const mainContainer = document.querySelector('.main-container')
  if (mainContainer) {
    mainContainerWidth.value = mainContainer.offsetWidth
  }
}

onMounted(() => {
  console.log('Home组件挂载，当前路由名称:', route.name);
  // 页面加载时检查路由名称
  if (route.name === 'Profile' || route.name === 'UserProfile') {
    showProfile.value = true;
    showEditProfile.value = false;
    nextTick(() => {
      profileRef.value?.initData?.();
    });
  } else if (route.name === 'EditProfile') {
    showProfile.value = false;
    showEditProfile.value = true;
  } else if (route.name === 'Home' || route.name === 'Notification') {
    showProfile.value = false;
    showEditProfile.value = false;
  }
  updateMainContainerWidth()
  window.addEventListener('resize', updateMainContainerWidth)
});

onUnmounted(() => {
  window.removeEventListener('resize', updateMainContainerWidth)
})
</script>

<template>
  <div class="home-container">
    <Header @init-profile="openProfile" />
    <div class="main-container">
      <div class="sidebar-wrapper" v-if="showSidebar" :style="{ transform: sidebarTransform }">
        <Sidebar />
      </div>
      <div class="content-area">
        <router-view v-if="route.name === 'Notification'" />
        <Profile v-else-if="showProfile" ref="profileRef" />
        <EditProfile v-else-if="showEditProfile" />
        <ArticleList v-else />
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  width: 100%;
  min-height: 100vh;
  background-color: #fff;
  margin-top: 80px;
}

.main-container {
  display: flex;
  width: 100%;
  max-width: 2000px;
  min-width: 800px;
  margin: 0 auto;
  position: relative;
  background-color: #fff;
}

.sidebar-wrapper {
  position: fixed;
  top: 80px;
  left: 50%;
  width: 250px;
  flex-shrink: 0;
  padding: 20px;
  height: calc(100vh - 80px);
  overflow-y: auto;
  background-color: #fff;
  z-index: 1000;
}

.content-area {
  flex: 1;
  /* padding: 10px 30px; */
  margin-left: 300px; 
  background-color: #fff;
}
</style>