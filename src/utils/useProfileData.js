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
  const fetchUserInfo = async (userId = null) => {
    try {
      console.log('fetchUserInfo - 用户ID:', userId);
      const url = userId 
        ? `http://localhost:3000/api/user/${userId}`
        : 'http://localhost:3000/api/user';
      
      console.log('请求URL:', url);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('获取到的用户数据:', data);
        userInfo.value = data.user;
        return data.user; // 返回用户数据
      } else {
        const errorData = await response.json();
        console.error('获取用户信息失败:', errorData);
        error.value = errorData.message || '获取用户信息失败';
        return null;
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      error.value = '获取用户信息失败';
      return null;
    }
  };

  const getNotesByTab = computed(() => {
    // console.log('当前标签页:', activeTab.value);
    // console.log('当前用户信息:', userInfo.value);
    // console.log('当前文章列表:', notes.value);
    
    // 如果正在查看其他用户，只返回笔记
    if (userInfo.value && userInfo.value.id !== auth.user?.id) {
      console.log('查看其他用户，只显示笔记');
      return notes.value;
    }
    
    // 查看自己的主页时，根据标签页返回不同内容
    switch (activeTab.value) {
      case 'notes':
        return notes.value;
      case 'favorites':
        return favorites.value;
      case 'likes':
        return likes.value;
      default:
        return notes.value;
    }
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
      const user = await fetchUserInfo();
      
      // 如果获取到用户信息，再获取其他数据
      if (user) {
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
      console.log('开始获取收藏文章...');
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('未找到登录token');
        favorites.value = [];
        return;
      }

      const response = await fetch('http://localhost:3000/api/articles/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('收藏文章API响应状态:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('获取到的收藏文章原始数据:', data);
        
        if (data.articles && Array.isArray(data.articles)) {
          favorites.value = data.articles.map(article => {
            // console.log('处理文章数据:', article);
            return {
              ...article,
              isCollected: true,
              images: article.images || [],
              likeCount: article.likeCount || 0,
              collectCount: article.collectCount || 0,
              commentCount: article.commentCount || 0,
              creator: article.creator ? {
                ...article.creator,
                avatar: article.creator.avatar ? article.creator.avatar : 'default-avatar.jpg'
              } : null
            };
          });
          console.log('处理后的收藏文章列表:', favorites.value);
        } else {
          console.error('收藏文章数据格式错误:', data);
          favorites.value = [];
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('获取收藏文章失败:', response.status, errorData);
        favorites.value = [];
      }
    } catch (error) {
      console.error('获取收藏文章失败:', error);
      error.value = '获取收藏文章失败';
      favorites.value = [];
    }
  };

  // 获取用户笔记
  const fetchUserNotes = async (userId = null) => {
    try {
      console.log('fetchUserNotes - 用户ID:', userId);
      const url = userId 
        ? `http://localhost:3000/api/articles/user/${userId}`
        : 'http://localhost:3000/api/articles/user';
      
      console.log('请求URL:', url);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('获取到的文章数据:', data);
        notes.value = data.articles.map(article => ({
          ...article,
          images: article.images || []
        }));
        return data.articles; // 返回文章数据
      } else {
        const errorData = await response.json();
        console.error('获取用户文章失败:', errorData);
        error.value = errorData.message || '获取用户文章失败';
        return [];
      }
    } catch (error) {
      console.error('获取用户文章失败:', error);
      error.value = '获取用户文章失败';
      return [];
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
    fetchUserInfo,
    fetchUserFavorites,
    fetchUserNotes,
    fetchUserLikes
  };
}
