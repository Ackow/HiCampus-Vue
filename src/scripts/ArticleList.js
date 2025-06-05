import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';

export function useArticleList() {
  const route = useRoute();
  const articles = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
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
  const loadArticles = async (page = 1, limit = 12) => {
    if (isLoading.value || !hasMore.value) return;

    try {
      console.log('加载文章');
      isLoading.value = true;
      error.value = null;

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

      // 获取每篇文章的点赞状态
      await checkArticlesLikeStatus();

    } catch (err) {
      console.error('加载文章失败:', err);
      error.value = '加载失败，请重试';
    } finally {
      isLoading.value = false;
    }
  };

  // 检查每篇文章的点赞状态
  const checkArticlesLikeStatus = async () => {
    if (!localStorage.getItem('token')) return;
    
    for (const article of articles.value) {
      try {
        const response = await fetch(`http://localhost:3000/api/articles/${article._id}/like-status`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          article.isLiked = data.isLiked;
        }
      } catch (error) {
        console.error('获取点赞状态失败:', error);
      }
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

  // 搜索文章
  const searchArticles = async (keyword) => {
    try {
      console.log('开始搜索文章，关键词:', keyword);
      const token = localStorage.getItem('token');
      
      // 构建请求头
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`http://localhost:3000/api/articles/search?keyword=${encodeURIComponent(keyword)}`, {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('搜索到的文章:', data);
        articles.value = data.articles.map(article => ({
          ...article,
          images: article.images || []
        }));
        return data.articles;
      } else {
        const errorData = await response.json();
        console.error('搜索文章失败:', errorData);
        throw new Error(errorData.message || '搜索失败');
      }
    } catch (error) {
      console.error('搜索文章失败:', error);
      throw error;
    }
  };

  // 获取文章列表
  const fetchArticles = async () => {
    try {
      console.log('开始获取文章列表');
      const token = localStorage.getItem('token');
      
      if (!token) {
        error.value = '请先登录后再查看文章';
        articles.value = [];
        return [];
      }
      
      // 构建请求头
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      const response = await fetch('http://localhost:3000/api/articles', {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('获取到的文章列表:', data);
        articles.value = data.articles.map(article => ({
          ...article,
          images: article.images || []
        }));
        return data.articles;
      } else {
        const errorData = await response.json();
        console.error('获取文章列表失败:', errorData);
        throw new Error(errorData.message || '获取文章列表失败');
      }
    } catch (error) {
      console.error('获取文章列表失败:', error);
      throw error;
    }
  };

  // 删除文章
  const deleteArticle = (articleId) => {
    articles.value = articles.value.filter(article => article._id !== articleId);
  };

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
    handleAvatarError,
    checkArticlesLikeStatus,
    searchArticles,
    fetchArticles,
    deleteArticle
  };
} 