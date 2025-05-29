// src/composables/useProfileData.js
import { ref, computed } from 'vue'
import { useAuth } from './useAuth.js'
import axios from 'axios'

export function useProfileData() {
  const auth = useAuth();

  const userInfo = ref({});
  const notes = ref([]);
  const favorites = ref([]);
  const likes = ref([]);
  const activeTab = ref('notes');
  const isLoading = ref(false);
  const error = ref(null);
  const isInitialized = ref(false);

  const getNotesByTab = computed(() => {
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
  });

  const initData = async () => {
    if (isInitialized.value) return;
    
    console.log('初始化个人信息数据');
    try {
      // 从本地存储获取基本信息
      userInfo.value = auth.getUserInfo();
      console.log('本地存储的用户信息:', userInfo.value);
      
      if (userInfo.value) {
        try {
          // 从服务器获取最新用户信息
          const token = auth.getToken();
          if (!token) {
            console.error('未找到认证token');
            return;
          }

          const response = await fetch('http://localhost:3000/api/user', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          console.log('获取用户信息响应状态:', response.status);
          if (response.ok) {
            const data = await response.json();
            console.log('服务器返回的用户信息:', data);
            if (data.user) {
              userInfo.value = data.user;
              localStorage.setItem('userInfo', JSON.stringify(data.user));
            }
          } else {
            console.error('获取用户信息失败:', response.status);
          }
        } catch (error) {
          console.error('获取用户信息出错:', error);
        }

        // 获取用户相关数据
        await fetchNotes();
        await fetchFavorites();
        await fetchLikes();
        isInitialized.value = true;
      }
    } catch (error) {
      console.error('初始化数据失败:', error);
    }
  };

  const fetchNotes = async () => {
    if (notes.value.length > 0) return;
    
    try {
      isLoading.value = true;
      const token = auth.getToken();
      if (!token) {
        throw new Error('未找到认证token');
      }

      const response = await axios.get('http://localhost:3000/api/articles/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('获取用户文章响应:', response.data);
      if (response.data.articles) {
        notes.value = response.data.articles.map(article => ({
          id: article._id,
          title: article.title,
          content: article.content,
          image: article.images && article.images.length > 0 ? article.images[0] : null,
          authorAvatar: article.author ? `http://localhost:3000/uploads/avatars/${article.author.avatar}` : null,
          authorName: article.author ? (article.author.nickname || article.author.username) : '未知用户',
          likes: article.likes ? article.likes.length : 0,
          comments: article.comments ? article.comments.length : 0,
          createdAt: article.createdAt
        }));
        console.log('处理后的笔记数据:', notes.value);
      }
    } catch (err) {
      console.error('获取用户文章失败:', err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchFavorites = async () => {
    if (favorites.value.length > 0) return;
    
    try {
      isLoading.value = true;
      const token = auth.getToken();
      if (!token) {
        throw new Error('未找到认证token');
      }

      const response = await axios.get('http://localhost:3000/api/articles/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('获取用户收藏响应:', response.data);
      if (response.data.articles) {
        favorites.value = response.data.articles.map(article => ({
          id: article._id,
          title: article.title,
          content: article.content,
          image: article.images && article.images.length > 0 ? article.images[0] : null,
          authorAvatar: article.creator.avatar,
          authorName: article.creator.nickname || article.creator.username,
          likes: article.likeCount,
          comments: article.commentCount,
          createdAt: article.createdAt
        }));
      }
    } catch (err) {
      console.error('获取用户收藏失败:', err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchLikes = async () => {
    if (likes.value.length > 0) return;
    
    try {
      isLoading.value = true;
      const token = auth.getToken();
      if (!token) {
        throw new Error('未找到认证token');
      }

      const response = await axios.get('http://localhost:3000/api/articles/likes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('获取用户点赞响应:', response.data);
      if (response.data.articles) {
        likes.value = response.data.articles.map(article => ({
          id: article._id,
          title: article.title,
          content: article.content,
          image: article.images && article.images.length > 0 ? article.images[0] : null,
          authorAvatar: article.creator.avatar,
          authorName: article.creator.nickname || article.creator.username,
          likes: article.likeCount,
          comments: article.commentCount,
          createdAt: article.createdAt
        }));
      }
    } catch (err) {
      console.error('获取用户点赞失败:', err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
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
    initData,
    isLoading,
    error,
    handleTabChange
  };
}
