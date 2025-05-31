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
    // 如果正在查看其他用户，只返回笔记
    if (userInfo.value && userInfo.value._id !== auth.user?._id) {
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
      return;
    }
    isLoading.value = true;
    error.value = null;
    
    try {
      // 先获取用户信息
      const user = await fetchUserInfo();
      
      // 如果获取到用户信息，再获取其他数据
      if (user) {
        // 如果是查看自己的主页，加载所有数据
        if (user._id === auth.user?._id) {
          await Promise.all([
            fetchUserNotes(),
            fetchUserFavorites(),
            fetchUserLikes()
          ]);
        } else {
          // 如果是查看其他用户的主页，只加载笔记
          await fetchUserNotes(user._id);
        }
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
        if (data.articles && Array.isArray(data.articles)) {
          likes.value = data.articles.map(article => ({
            ...article,
            isLiked: true,
            images: article.images || [],
            likeCount: article.likeCount || 0,
            collectCount: article.collectCount || 0,
            commentCount: article.commentCount || 0,
            creator: article.creator ? {
              ...article.creator,
              avatar: article.creator.avatar ? article.creator.avatar : 'default-avatar.jpg'
            } : null
          }));
        } else {
          likes.value = [];
        }
      } else {
        likes.value = [];
      }
    } catch (error) {
      console.error('获取点赞文章失败:', error);
      error.value = '获取点赞文章失败';
      likes.value = [];
    }
  };

  const fetchUserFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        favorites.value = [];
        return;
      }

      const response = await fetch('http://localhost:3000/api/articles/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.articles && Array.isArray(data.articles)) {
          favorites.value = data.articles.map(article => ({
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
          }));
        } else {
          favorites.value = [];
        }
      } else {
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
      const url = userId 
        ? `http://localhost:3000/api/articles/user/${userId}`
        : 'http://localhost:3000/api/articles/user';
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        notes.value = data.articles.map(article => ({
          ...article,
          images: article.images || [],
          likeCount: article.likeCount || 0,
          collectCount: article.collectCount || 0,
          commentCount: article.commentCount || 0,
          creator: article.creator ? {
            ...article.creator,
            avatar: article.creator.avatar ? article.creator.avatar : 'default-avatar.jpg'
          } : null
        }));
        return data.articles;
      } else {
        const errorData = await response.json();
        error.value = errorData.message || '获取用户文章失败';
        return [];
      }
    } catch (error) {
      console.error('获取用户文章失败:', error);
      error.value = '获取用户文章失败';
      return [];
    }
  };

  const handleTabChange = async (tab) => {
    activeTab.value = tab;
    
    // 如果是查看自己的主页，根据标签页加载相应数据
    if (userInfo.value && userInfo.value._id === auth.user?._id) {
      try {
        isLoading.value = true;
        switch (tab) {
          case 'notes':
            await fetchUserNotes();
            break;
          case 'favorites':
            await fetchUserFavorites();
            break;
          case 'likes':
            await fetchUserLikes();
            break;
        }
      } catch (error) {
        console.error('切换标签页加载数据失败:', error);
        error.value = '加载数据失败';
      } finally {
        isLoading.value = false;
      }
    }
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
