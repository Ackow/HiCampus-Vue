<template>
  <header class="site-header">
    <div class="container header-content">
      <div class="logo-container">
        <a href="index.html">
          <img src="/assets/images/logo.png" alt="HiCampus Logo" class="logo-img">
        </a>
        <span class="logo-text">HiCampus</span>
      </div>

      <div class="header-right-actions">
        <!-- 搜索按钮 -->
        <button
          class="search-trigger-button"
          id="searchTriggerButton"
          aria-label="打开搜索框"
          :class="{ hidden: searchActive }"
          @click.stop="openSearch"
          ref="searchTriggerButton"
        >
          <img src="/assets/images/搜索.svg" alt="搜索图标" class="search-trigger-icon">
        </button>
        <!-- 未登录状态 -->
        <div class="auth-buttons" id="authButtons" :style="{ display: isLoggedIn ? 'none' : 'block' }">
          <router-link to="/register-login" class="auth-button">登录/注册</router-link>
        </div>
        <!-- 已登录状态 -->
        <div class="user-profile-container" id="userProfile" :style="{ display: isLoggedIn ? 'flex' : 'none' }">
          <div class="user-profile-wrapper">
            <a class="user-profile-link">
              <img :alt="userInfo?.nickname || '用户头像'" :src="userInfo?.avatar || 'http://localhost:3000/uploads/avatars/default-avatar.jpg'" class="user-avatar">
              <span class="user-nickname">{{ userInfo?.nickname || userInfo?.username || '加载中...' }}</span>
            </a>
            <div class="user-dropdown-menu">
              <a href="#profile" class="dropdown-item" @click="handleProfileClick">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>个人信息</span>
              </a>
              <button class="dropdown-item" @click="logout">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area" ref="searchArea" :class="{ active: searchActive }">
      <div
        class="search-input-wrapper"
        ref="searchInputWrapper"
        @click.stop
      >
        <input
          type="text"
          class="search-input"
          placeholder="输入你感兴趣的内容..."
          ref="searchInput"
          v-model="searchKeyword"
          @keydown.esc="closeSearch"
          @keyup.enter="handleSearch"
        >
        <button 
          class="clear-search-btn" 
          @click="clearSearch"
        >
          <img src="/assets/images/叉.svg" alt="删除" class="clear-icon">
        </button>
        <button 
          class="search-btn" 
          @click="handleSearch"
        >
          <img src="/assets/images/搜索.svg" alt="搜索" class="search-icon">
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useSearch } from '../utils/useSearch.js'
import { ref, onMounted, defineEmits, onUnmounted, nextTick } from 'vue';
import { useAuth } from '../utils/useAuth.js';
import { useRouter } from 'vue-router';
import { eventBus } from '../utils/eventBus.js';

const {
  searchActive,
  searchInput,
  searchInputWrapper,
  searchTriggerButton,
  searchArea,
  openSearch,
  closeSearch
} = useSearch()

const searchKeyword = ref('')
const emit = defineEmits(['init-profile'])

const auth = useAuth();
const router = useRouter();
const isLoggedIn = ref(auth.checkLoginStatus());
const userInfo = ref(auth.getUserInfo());

const handleUserInfoUpdate = (event) => {
  // console.log('Header: 收到用户信息更新事件', event.detail)
  if (event.detail) {
    // 立即更新用户信息
    userInfo.value = event.detail
    
    // 强制更新头像显示
    const avatarImg = document.querySelector('.user-avatar')
    if (avatarImg) {
      avatarImg.src = userInfo.value.avatar || 'http://localhost:3000/uploads/avatars/default-avatar.jpg'
    }
  }
}

onMounted(() => {
  // 初始化时获取最新用户信息
  userInfo.value = auth.getUserInfo()
  
  // 设置更新回调
  auth.setUpdateUICallback((status) => {
    isLoggedIn.value = status
    userInfo.value = auth.getUserInfo()
  })
  
  // 添加事件监听
  window.addEventListener('userInfoUpdated', handleUserInfoUpdate)
});

onUnmounted(() => {
  window.removeEventListener('userInfoUpdated', handleUserInfoUpdate)
});

const logout = () => {
  auth.logout();
};

const handleProfileClick = () => {
  console.log('Header:个人信息按钮被点击');
  router.push({ name: 'Profile' });
  emit('init-profile');
}

// 处理搜索
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    console.log('触发搜索:', searchKeyword.value.trim())
    eventBus.emitSearch(searchKeyword.value.trim())
    closeSearch()
  }
}

// 清除搜索
const clearSearch = () => {
  searchKeyword.value = ''
  searchInput.value?.focus()
}
</script>

<style scoped>
@import '../styles/header.css';
</style>