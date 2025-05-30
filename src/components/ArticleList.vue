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
              <span class="likes">
                <img :src="article.isLiked ? '/assets/images/爱心-红.svg' : '/assets/images/爱心.svg'" 
                     :alt="article.isLiked ? '已点赞' : '未点赞'" 
                     class="btn-icon"
                     :class="{ 'liked': article.isLiked }"> 
                {{ article.likeCount || 0 }}
              </span>
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
      @update-like-count="updateLikeCount"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
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
  { label: '美食', value: '#美食' },
  { label: '校园风景', value: '#校园风景' },
  { label: '吐槽区', value: '#吐槽区' },
  { label: '游戏交流', value: '#游戏交流' },
  { label: '二手闲置', value: '#二手闲置' },
  { label: '竞赛分享', value: '#竞赛分享' }
];

const {
  articles,
  isLoading,
  error,
  getArticleImage,
  getAvatarUrl,
  handleImageError,
  handleAvatarError,
  checkArticlesLikeStatus
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
  currentPost.value = {
    id: article._id,
    username: article.creator.nickname,
    avatar: getAvatarUrl(article.creator),
    title: article.title,
    description: article.content,
    images: article.images ? article.images.map(img => `http://localhost:3000/uploads/images/${img}`) : [],
    likes: article.likeCount || 0,
    comments: article.comments || []
  };
  showPostDetail.value = true;
};

const closePostDetail = () => {
  showPostDetail.value = false;
  currentPost.value = null;
};

const toggleLike = () => {
  if (currentPost.value) {
    currentPost.value.isLiked = !currentPost.value.isLiked;
    currentPost.value.likes += currentPost.value.isLiked ? 1 : -1;
  }
};

const updateLikeCount = (newCount) => {
  if (currentPost.value) {
    currentPost.value.likes = newCount;
  }
};

// 监听文章列表变化
watch(() => articles.value, async (newArticles) => {
  if (newArticles && newArticles.length > 0) {
    await checkArticlesLikeStatus();
  }
}, { immediate: true });

onMounted(() => {
  console.log('ArticleList mounted, articles:', articles.value);
});
</script>

<style scoped>
@import '../styles/articleList.css';
</style> 