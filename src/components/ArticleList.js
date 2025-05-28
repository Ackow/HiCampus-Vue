import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';

export function useArticleList() {
  const route = useRoute();
  const articles = ref([]);
  const isLoading = ref(false);
  const error = ref('');
  const currentPage = ref(1);
  const hasMore = ref(true);
  const lastScrollTop = ref(0);

  // 获取文章图片URL
  const getArticleImage = (article) => {
    if (article.images && article.images.length > 0) {
      return `http://localhost:3000/uploads/images/${article.images[0]}`;
    }
    return '/assets/images/logo.png';
  };

  // 获取用户头像URL
  const getAvatarUrl = (creator) => {
    if (creator.avatar) {
      return `http://localhost:3000/uploads/avatars/${creator.avatar}`;
    }
    return 'http://localhost:3000/uploads/avatars/default-avatar.jpg';
  };

  // 处理图片加载错误
  const handleImageError = (event) => {
    event.target.src = '/assets/images/logo.png';
  };

  // 处理头像加载错误
  const handleAvatarError = (event) => {
    event.target.src = 'http://localhost:3000/uploads/avatars/default-avatar.jpg';
  };

  // 加载文章
  const loadArticles = async (page = 1, limit = 8) => {
    if (isLoading.value || !hasMore.value) return;

    try {
      console.log('加载文章');
      isLoading.value = true;
      error.value = '';

      const response = await fetch(`http://localhost:3000/api/articles?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      console.log('文章数据:', data);

      if (page === 1) {
        articles.value = data.articles;
      } else {
        articles.value = [...articles.value, ...data.articles];
      }

      hasMore.value = currentPage.value < data.totalPages;
      currentPage.value++;

    } catch (err) {
      console.error('加载文章失败:', err);
      error.value = '加载失败，请重试';
    } finally {
      isLoading.value = false;
    }
  };

  // 处理滚动
  const handleScroll = () => {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const clientHeight = document.documentElement.clientHeight;
    
    // 判断是否向下滚动
    const isScrollingDown = scrollTop > lastScrollTop.value;
    lastScrollTop.value = scrollTop;

    // 当滚动到距离底部10px时，且正在向下滚动时加载更多
    if (scrollHeight - scrollTop - clientHeight < 10 && isScrollingDown) {
      console.log('向下滚动到底部，加载更多');
      loadArticles(currentPage.value);
    }
  };

  // 处理路由变化
  const handleRouteChange = () => {
    if (route.name === 'Home') {
      // 重置状态
      currentPage.value = 1;
      hasMore.value = true;
      articles.value = [];
      // 重新加载文章
      loadArticles();
    }
  };

  // 监听路由变化
  watch(() => route.name, handleRouteChange);

  onMounted(() => {
    window.addEventListener('scroll', handleScroll);
    loadArticles();
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
  });

  return {
    articles,
    isLoading,
    error,
    getArticleImage,
    getAvatarUrl,
    handleImageError,
    handleAvatarError
  };
} 