<template>
  <header class="site-header">
    <div class="container header-content">
      <div class="logo-container">
        <router-link to="/">
          <img src="/assets/images/logo.png" alt="HiCampus Logo" class="logo-img">
        </router-link>
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
        <div class="auth-buttons" id="authButtons">
          <button class="auth-button" @click="goToLogin">登录/注册</button>
        </div>
        <!-- 已登录状态 -->
        <div class="user-profile-container" id="userProfile" style="display: none;">
          <div class="user-profile-wrapper">
            <div class="user-profile-link">
              <img alt="用户头像" class="user-avatar">
              <span class="user-nickname">加载中...</span>
            </div>
            <div class="user-dropdown-menu">
              <router-link to="/profile" class="dropdown-item">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>个人信息</span>
              </router-link>
              <button class="dropdown-item" @click="handleLogout">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span>退出登录</span>
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
          @keydown.esc="closeSearch"
        >
      </div>
    </div>
  </header>
</template>

<script setup>
import { useSearch } from '../composables/useSearch'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { onMounted } from 'vue'

const {
  searchActive,
  searchInput,
  searchInputWrapper,
  searchTriggerButton,
  searchArea,
  openSearch,
  closeSearch
} = useSearch()

const router = useRouter()
const { checkLoginStatus, logout } = useAuth()

// 检查登录状态
onMounted(() => {
  checkLoginStatus()
})

// 处理退出登录
const handleLogout = () => {
  logout()
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style>
@import '../styles/header.css';
</style> 