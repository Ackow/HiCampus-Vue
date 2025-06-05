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
      <div v-for="article in filteredArticles" :key="article._id" class="content-card" @click="handleCardClick(article)">
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
              <img :src="getUserDisplayInfo(article).avatar" 
                   alt="用户头像" 
                   class="user-avatar-small"
                   @error="handleAvatarError">
              <span class="username">{{ getUserDisplayInfo(article).nickname }}</span>
            </div>
            <div class="interaction-info">
              <span class="likes">
                <img :src="article.isLiked ? './assets/images/爱心-红.svg' : './assets/images/爱心.svg'" 
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
      @article-deleted="handleArticleDeleted"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useArticleList } from '../scripts/ArticleList.js';
import PostDetail from '../views/PostDetail.vue';
import { eventBus } from '../utils/eventBus.js';
import '../styles/articleList.css';

const selectedCategory = ref('all');
const showPostDetail = ref(false);
const currentPost = ref(null);
const searchKeyword = ref('');

const categories = [
  { label: '全部', value: 'all' },
  { label: '校园生活', value: '#校园生活' },
  { label: '学习交流', value: '#学习交流' },
  { label: '社团活动', value: '#社团活动' },
  // { label: '美食', value: '#美食' },
  // { label: '校园风景', value: '#校园风景' },
  { label: '吐槽区', value: '#吐槽区' },
  { label: '游戏交流', value: '#游戏交流' },
  { label: '二手闲置', value: '#二手闲置' },
  { label: '竞赛分享', value: '#竞赛分享' }
];

// 添加随机昵称生成函数
const generateRandomNickname = () => {
  const adjectives = ['快乐的', '机智的', '可爱的', '神秘的', '活泼的', '安静的', '聪明的', '善良的'];
  const nouns = ['小兔子', '小猫咪', '小狗狗', '小熊猫', '小松鼠', '小仓鼠', '小浣熊', '小狐狸'];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return randomAdjective + randomNoun;
};

// 获取用户显示信息
const getUserDisplayInfo = (article) => {
  if (article.topics && article.topics.includes('#吐槽区')) {
    return {
      nickname: generateRandomNickname(),
      avatar: 'http://localhost:3000/uploads/avatars/default-avatar.png'
    };
  }
  return {
    nickname: article.creator.nickname,
    avatar: getAvatarUrl(article.creator)
  };
};

const {
  articles,
  isLoading,
  error,
  getAvatarUrl,
  handleImageError,
  handleAvatarError,
  checkArticlesLikeStatus,
  searchArticles,
  deleteArticle
} = useArticleList();

// 获取文章图片
const getArticleImage = (article) => {
  // 优先使用视频预览图
  if (article.video && article.video.thumbnail) {
    return article.video.thumbnail;
  }
  
  // 其次使用视频第一帧作为预览图
  if (article.video && article.video.url) {
    return article.video.url;
  }

  // 最后使用图片
  if (article.images && article.images.length > 0) {
    const imagePath = article.images[0];
    // 如果已经是完整URL，直接返回
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // 如果是相对路径，添加服务器地址
    return `http://localhost:3000/uploads/images/${imagePath}`;
  }
  return null;
};

// 添加 handleSearch 函数
const handleSearch = async (keyword) => {
  console.log('ArticleList: 处理搜索请求:', keyword);
  if (keyword) {
    await searchArticles(keyword);
  }
};

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
  // 检查是否登录
  const token = localStorage.getItem('token');
  if (!token) {
    window.alert('请先登录后再查看文章详情');
    return;
  }

  const userInfo = getUserDisplayInfo(article);
  currentPost.value = {
    id: article._id,
    username: userInfo.nickname,
    avatar: userInfo.avatar,
    title: article.title,
    description: article.content,
    images: article.images ? article.images.map(img => `http://localhost:3000/uploads/images/${img}`) : [],
    likeCount: article.likeCount || 0,
    collectCount: article.collectCount || 0,
    commentCount: article.commentCount || 0,
    isLiked: article.isLiked || false,
    isCollected: article.isCollected || false,
    topics: article.topics || [],
    creatorId: article.creator._id,
    location: article.location || null,
    adminMentions: article.adminMentions || [],
    mentionedUsers: article.mentionedUsers || [],
    video: article.video || null
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

// 修改文章卡片点击事件
const handleCardClick = (article) => {
  // 检查是否登录
  const token = localStorage.getItem('token');
  if (!token) {
    window.alert('请先登录后再查看文章详情');
    return;
  }
  openPostDetail(article);
};

// 监听搜索事件
watch(eventBus.onSearch(), async (newKeyword) => {
  if (newKeyword) {
    console.log('ArticleList: 收到搜索关键词:', newKeyword)
    await searchArticles(newKeyword);
  }
});

// 监听文章列表变化
watch(() => articles.value, async (newArticles) => {
  if (newArticles && newArticles.length > 0) {
    await checkArticlesLikeStatus();
  }
}, { immediate: true });

// 处理文章删除
const handleArticleDeleted = (articleId) => {
  deleteArticle(articleId);
  closePostDetail();
};

onMounted(() => {
  console.log('ArticleList mounted, articles:', articles.value);
});

defineExpose({
  handleSearch
});
</script>

<style scoped>
@import '../styles/articleList.css';

.search-active {
  background-color: #f5f5f5;
}
</style> 