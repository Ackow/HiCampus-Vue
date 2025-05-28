<template>
    <div class="content-container">
      <div class="content-grid">
        <div class="content-card" v-for="(item, idx) in cards" :key="idx">
          <div class="card-image">
            <img :src="item.image" alt="内容图片">
          </div>
          <div class="card-content">
            <h3 class="card-title">{{ item.title }}</h3>
            <p class="card-description">{{ item.description }}</p>
            <div class="card-footer">
              <div class="user-info">
                <img :src="item.avatar" alt="用户头像" class="user-avatar-small">
                <span class="username">{{ item.username }}</span>
              </div>
              <div class="interaction-info">
                <span class="likes">❤️ {{ item.likes }}</span>
                <span class="comments">💬 {{ item.comments }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onActivated } from 'vue'
  import { useRouter } from 'vue-router'
  import { cards } from '../composables/useHomeCards'

  const router = useRouter()
  const isLoading = ref(true)

  const loadData = async () => {
    try {
      isLoading.value = true
      // 这里添加数据加载逻辑
      await new Promise(resolve => setTimeout(resolve, 500)) // 模拟加载延迟
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    loadData()
  })

  onActivated(() => {
    loadData()
  })
  </script>
  
  <style src="../styles/home.css"></style>

  <style scoped>
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>