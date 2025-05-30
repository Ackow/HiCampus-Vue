// src/composables/useProfileData.js
import { ref, computed } from 'vue'
import { useAuth } from './useAuth.js'
import axios from 'axios'

export function useProfileData() {
  const auth = useAuth();

  const userInfo = ref(null);
  const notes = ref([]);
  const favorites = ref([]);
  const likes = ref([]);
  const activeTab = ref('notes');
  const isLoading = ref(false);
  const error = ref(null);
  const isInitialized = ref(false);

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        userInfo.value = data.user;
        // console.log('获取到的用户信息:', userInfo.value);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      error.value = '获取用户信息失败';
    }
  };

  const getNotesByTab = computed(() => {
    const articles = (() => {
      switch (activeTab.value) {
        case 'notes':
          return notes.value;
        case 'favorites':
          return favorites.value;
        case 'likes':
          return likes.value;
        default:
          return [];
      }
    })();
    // console.log('当前标签页文章数据:', articles);
    return articles;
  });

  const initData = async () => {
    if (!localStorage.getItem('token')) {
      console.log('未检测到登录token');
      return;
    }
    isLoading.value = true;
    error.value = null;
    
    try {
      // 先获取用户信息
      await fetchUserInfo();
      
      // 如果获取到用户信息，再获取其他数据
      if (userInfo.value) {
        await Promise.all([
          fetchUserNotes(),
          fetchUserFavorites(),
          fetchUserLikes()
        ]);
      }
    } catch (error) {
      console.error('初始化数据失败:', error);
      error.value = '加载数据失败';
    } finally {
      isLoading.value = false;
    }
  };

  const fetchUserLikes = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/articles/likes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('获取到的点赞文章数据:', data);
        likes.value = data.articles.map(article => ({
          ...article,
          isLiked: true,
          images: article.images || []
        }));
        console.log('处理后的点赞文章数据:', likes.value);
      }
    } catch (error) {
      console.error('获取点赞文章失败:', error);
      error.value = '获取点赞文章失败';
    }
  };

  const fetchUserFavorites = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/articles/favorites', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('获取到的收藏文章数据:', data);
        favorites.value = data.articles.map(article => ({
          ...article,
          isCollected: true,
          images: article.images || []
        }));
        console.log('处理后的收藏文章数据:', favorites.value);
      }
    } catch (error) {
      console.error('获取收藏文章失败:', error);
      error.value = '获取收藏文章失败';
    }
  };

  const fetchUserNotes = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/articles/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // console.log('获取到的用户文章数据:', data);
        notes.value = data.articles.map(article => ({
          ...article,
          images: article.images || []
        }));
        // console.log('处理后的用户文章数据:', notes.value);
      }
    } catch (error) {
      console.error('获取用户文章失败:', error);
      error.value = '获取用户文章失败';
    }
  };

  const handleTabChange = (tab) => {
    activeTab.value = tab;
  };

  return {
    userInfo,
    notes,
    favorites,
    likes,
    activeTab,
    getNotesByTab,
    isLoading,
    error,
    initData,
    handleTabChange,
    fetchUserInfo
  };
}
