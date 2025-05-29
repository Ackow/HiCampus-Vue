<template>
  <div class="article-container">
    <div class="category-tabs">
      <div 
        v-for="category in categories" 
        :key="category.value"
        :class="['category-tab', { active: selectedCategory === category.value }]"
        @click="handleCategoryChange(category.value)"
      >
        {{ category.label }}
      </div>
    </div>

    <div class="content-grid">
      <div v-for="article in filteredArticles" :key="article._id" class="content-card" @click.stop="openPostDetail(article)">
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
              <span class="likes"><img src="/assets/images/爱心.svg" alt="点赞" class="btn-icon"> {{ article.likeCount || 0 }}</span>
              <span class="comments"><img src="/assets/images/评论.svg" alt="评论" class="btn-icon"> {{ article.commentCount || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isLoading" class="loading-spinner">加载中...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <!-- 帖子详情弹窗 -->
    <PostDetail 
      v-if="showPostDetail"
      :show="showPostDetail"
      :post-detail="currentPost"
      @close="closePostDetail"
      @toggle-like="toggleLike"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useArticleList } from '../scripts/ArticleList.js';
import PostDetail from '../views/PostDetail.vue';
import '../styles/articleList.css';

const selectedCategory = ref('all');
const showPostDetail = ref(false);
const currentPost = ref(null);

const categories = [
  { label: '全部', value: 'all' },
  { label: '校园生活', value: '#校园生活' },
  { label: '学习交流', value: '#学习交流' },
  { label: '社团活动', value: '#社团活动' },
  { label: '校园美食', value: '#校园美食' },
  { label: '校园风景', value: '#校园风景' },
  { label: '校园趣事', value: '#校园趣事' }
];

const {
  articles,
  isLoading,
  error,
  getArticleImage,
  getAvatarUrl,
  handleImageError,
  handleAvatarError
} = useArticleList();

const filteredArticles = computed(() => {
  if (selectedCategory.value === 'all') {
    return articles.value;
  }
  return articles.value.filter(article => 
    article.topics && article.topics.includes(selectedCategory.value)
  );
});

const handleCategoryChange = (category) => {
  selectedCategory.value = category;
};

const openPostDetail = (article) => {
  console.log('Opening post detail:', article); // 添加调试日志
  currentPost.value = {
    id: article._id,
    username: article.creator.nickname,
    avatar: getAvatarUrl(article.creator),
    title: article.title,
    description: article.content,
    images: article.images ? article.images.map(img => `http://localhost:3000/uploads/images/${img}`) : [],
    likes: article.likeCount || 0,
    isLiked: false,
    comments: article.comments || []
  };
  showPostDetail.value = true;
  console.log('Post detail state:', { showPostDetail: showPostDetail.value, currentPost: currentPost.value }); // 添加调试日志
};

const closePostDetail = () => {
  console.log('Closing post detail'); // 添加调试日志
  showPostDetail.value = false;
  currentPost.value = null;
};

const toggleLike = () => {
  if (currentPost.value) {
    currentPost.value.isLiked = !currentPost.value.isLiked;
    currentPost.value.likes += currentPost.value.isLiked ? 1 : -1;
  }
};

// 确保组件挂载后数据已经加载
onMounted(() => {
  console.log('ArticleList mounted, articles:', articles.value);
});
</script>

<style scoped>
@import '../styles/articleList.css';

.article-container {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
}

.category-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.category-tab {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  background-color: #f5f5f5;
  border: 1px solid transparent;
}

.category-tab:hover {
  background-color: #f0f2f5;
  color: #7BB4F4;
}

.category-tab.active {
  background-color: #7BB4F4;
  color: white;
  border-color: #7BB4F4;
}

.content-card {
  cursor: pointer;
  transition: transform 0.2s ease;
  position: relative;
  z-index: 1;
}

.content-card:hover {
  transform: translateY(-2px);
}
</style> 