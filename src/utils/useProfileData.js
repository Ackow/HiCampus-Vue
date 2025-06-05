// src/composables/useProfileData.js
import { ref, computed } from 'vue'
import { useAuth } from './useAuth.js'
import axios from 'axios'
import { useRoute } from 'vue-router'

export function useProfileData() {
  const auth = useAuth();
  const route = useRoute();

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
      const url = userId 
        ? `http://localhost:3000/api/user/${userId}`
        : 'http://localhost:3000/api/user';
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          // 确保用户数据包含 _id 字段
          const userData = {
            ...data.user,
            _id: data.user.id
          };
          userInfo.value = userData;
          return userData;
        }
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
    const currentUser = auth.getUserInfo();
    const viewedUserId = route.params.userId;

    // 如果正在查看其他用户，只返回笔记
    if (viewedUserId) {
      return notes.value.map(note => ({
        ...note,
        isLiked: note.likedBy ? note.likedBy.includes(currentUser?._id) : false,
        isCollected: note.collectedBy ? note.collectedBy.includes(currentUser?._id) : false,
        images: note.images || [],
        likeCount: note.likeCount || 0,
        collectCount: note.collectCount || 0,
        commentCount: note.commentCount || 0,
        creator: note.creator ? {
          ...note.creator,
          avatar: note.creator.avatar ? note.creator.avatar : 'default-avatar.jpg'
        } : null
      }));
    }
    
    // 查看自己的主页时，根据标签页返回不同内容
    switch (activeTab.value) {
      case 'notes':
        return notes.value.map(note => {
          const isLiked = note.likedBy ? note.likedBy.includes(userInfo.value?._id) : false;
          return {
            ...note,
            isLiked
          };
        });
      case 'favorites':
        return favorites.value.map(note => {
          const isCollected = note.collectedBy ? note.collectedBy.includes(userInfo.value?._id) : false;
          return {
            ...note,
            isCollected
          };
        });
      case 'likes':
        return likes.value.map(note => {
          const isLiked = note.likedBy ? note.likedBy.includes(userInfo.value?._id) : false;
          return {
            ...note,
            isLiked
          };
        });
      default:
        return notes.value.map(note => {
          const isLiked = note.likedBy ? note.likedBy.includes(userInfo.value?._id) : false;
          return {
            ...note,
            isLiked
          };
        });
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
        if (!route.params.userId || route.params.userId === user._id) {
          await Promise.all([
            fetchUserNotes(),
            fetchUserFavorites(),
            fetchUserLikes()
          ]);
        } else {
          // 如果是查看其他用户的主页，只加载笔记
          await fetchUserNotes(route.params.userId);
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
            likedBy: [...(article.likedBy || []), auth.user?._id],
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
          likedBy: article.likedBy || [],
          collectedBy: article.collectedBy || [],
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
    if (!route.params.userId || route.params.userId === auth.user?._id) {
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

  const handleLikeUpdate = async (data) => {
    console.log('收到点赞更新:', data);
    const { articleId, likeCount, isLiked } = data;
    
    try {
      const response = await fetch(`http://localhost:3000/api/articles/${articleId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isLiked })
      });

      if (response.ok) {
        // 更新所有相关列表中的文章数据
        [notes.value, favorites.value, likes.value].forEach(list => {
          const article = list.find(item => item._id === articleId);
          if (article) {
            article.likeCount = likeCount;
            article.isLiked = isLiked;
            // 更新 likedBy 数组
            if (isLiked) {
              article.likedBy = [...(article.likedBy || []), auth.user?._id];
            } else {
              article.likedBy = (article.likedBy || []).filter(id => id !== auth.user?._id);
            }
            console.log('更新后的文章:', article);
          }
        });
      } else {
        const errorData = await response.json();
        console.error('点赞操作失败:', errorData);
        throw new Error(errorData.message || '点赞操作失败');
      }
    } catch (error) {
      console.error('点赞操作失败:', error);
      throw error;
    }
  };

  const handleCollectUpdate = async (data) => {
    console.log('收到收藏更新:', data);
    const { articleId, collectCount, isCollected } = data;
    
    try {
      const response = await fetch(`http://localhost:3000/api/articles/${articleId}/collect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isCollected })
      });

      if (response.ok) {
        // 更新所有相关列表中的文章数据
        [notes.value, favorites.value, likes.value].forEach(list => {
          const article = list.find(item => item._id === articleId);
          if (article) {
            article.collectCount = collectCount;
            article.isCollected = isCollected;
            // 更新 collectedBy 数组
            if (isCollected) {
              article.collectedBy = [...(article.collectedBy || []), auth.user?._id];
            } else {
              article.collectedBy = (article.collectedBy || []).filter(id => id !== auth.user?._id);
            }
            console.log('更新后的文章:', article);
          }
        });

        // 如果当前在收藏标签页，重新获取收藏列表
        if (activeTab.value === 'favorites') {
          console.log('当前在收藏标签页，重新获取收藏列表');
          await fetchUserFavorites();
        }
      } else {
        const errorData = await response.json();
        console.error('收藏操作失败:', errorData);
        throw new Error(errorData.message || '收藏操作失败');
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      throw error;
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
    fetchUserLikes,
    handleLikeUpdate,
    handleCollectUpdate
  };
}
