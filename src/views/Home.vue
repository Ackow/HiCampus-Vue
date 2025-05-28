<script setup>
import Header from '../components/Header.vue'
import Sidebar from '../components/Sidebar.vue'
import Profile from '../components/Profile.vue'
import EditProfile from '../components/EditProfile.vue'
import ArticleList from '../components/ArticleList.vue'
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
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
watch(() => route.name, (newName) => {
  console.log('路由名称变化:', newName);
  if (newName === 'Profile') {
    showProfile.value = true;
    showEditProfile.value = false;
    nextTick(() => {
      profileRef.value?.initData?.();
    });
  } else if (newName === 'EditProfile') {
    showProfile.value = false;
    showEditProfile.value = true;
  } else if (newName === 'Home') {
    showProfile.value = false;
    showEditProfile.value = false;
  }
}, { immediate: true });

onMounted(() => {
  console.log('Home组件挂载，当前路由名称:', route.name);
  // 页面加载时检查路由名称
  if (route.name === 'Profile') {
    showProfile.value = true;
    showEditProfile.value = false;
    nextTick(() => {
      profileRef.value?.initData?.();
    });
  } else if (route.name === 'EditProfile') {
    showProfile.value = false;
    showEditProfile.value = true;
  }
});
</script>

<template>
  <div class="home-container">
    <Header @init-profile="openProfile" />
    <div class="main-container">
      <div class="sidebar-wrapper" v-if="showSidebar">
        <Sidebar />
      </div>
      <div class="content-area">
        <!-- 这里可以添加更多内容 -->
        <Profile v-if="showProfile" ref="profileRef" />
        <EditProfile v-if="showEditProfile" />
        <ArticleList v-if="!showProfile && !showEditProfile" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  width: 100%;
  min-height: 100vh;
  background-color: #fff;
}

.main-container {
  display: flex;
  max-width: 2000px;
  min-width: 800px;
  margin: 0 auto;
  position: relative;
  background-color: #fff;
}

.sidebar-wrapper {
  width: 250px;
  flex-shrink: 0;
}

.content-area {
  flex: 1; /* 让内容区占据剩余空间 */
  padding: 20px;
  margin-top: 80px;
  margin-left: 20px;
  background-color: #fff;
}
</style>