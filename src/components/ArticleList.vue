<template>
  <div class="content-grid">
    <div v-for="article in articles" :key="article._id" class="content-card">
      <div class="card-image">
        <img :src="getArticleImage(article)" 
             alt="内容图片"
             @error="handleImageError">
      </div>
      <div class="card-content">
        <h3 class="card-title">{{ article.title }}</h3>
        <p class="card-description">{{ article.content }}</p>
        <div class="card-footer">
          <div class="user-info">
            <img :src="getAvatarUrl(article.creator)" 
                 alt="用户头像" 
                 class="user-avatar-small"
                 @error="handleAvatarError">
            <span class="username">{{ article.creator.nickname }}</span>
          </div>
          <div class="interaction-info">
            <span class="likes">❤️ {{ article.likeCount || 0 }}</span>
            <span class="comments">💬 {{ article.commentCount || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="isLoading" class="loading-spinner">加载中...</div>
  <div v-if="error" class="error-message">{{ error }}</div>
</template>

<script setup>
import { useArticleList } from './ArticleList.js';
import '../styles/articleList.css';

const {
  articles,
  isLoading,
  error,
  getArticleImage,
  getAvatarUrl,
  handleImageError,
  handleAvatarError
} = useArticleList();
</script>

<style scoped>

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.content-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.content-card:hover {
  transform: translateY(-5px);
}

.card-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  padding: 15px;
}

.card-title {
  margin: 0 0 10px;
  font-size: 1.2rem;
  font-weight: bold;
}

.card-description {
  margin: 0 0 15px;
  font-size: 0.9rem;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar-small {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.username {
  font-size: 0.9rem;
  color: #333;
}

.interaction-info {
  display: flex;
  gap: 15px;
  color: #666;
  font-size: 0.9rem;
}

.loading-spinner {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error-message {
  text-align: center;
  padding: 20px;
  color: #ff4d4f;
  background: #fff2f0;
  border-radius: 4px;
  margin: 10px 0;
}
</style> 