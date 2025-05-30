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
    isLoading.value = true;
    error.value = null;
    try {
      // 获取用户信息
      const userResponse = await fetch('http://localhost:3000/api/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (userResponse.ok) {
        const data = await userResponse.json();
        userInfo.value = data.user;
      }

      // 获取用户发布的文章
      const notesResponse = await fetch('http://localhost:3000/api/articles/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (notesResponse.ok) {
        const data = await notesResponse.json();
        notes.value = data.articles.map(article => ({
          id: article._id,
          title: article.title,
          content: article.content,
          authorName: article.creator.nickname,
          authorAvatar: article.creator.avatar,
          image: article.images && article.images.length > 0 ? article.images[0] : null,
          likes: article.likeCount || 0,
          comments: article.commentCount || 0,
          createdAt: article.createdAt
        }));
      }

      // 获取用户收藏的文章
      const favoritesResponse = await fetch('http://localhost:3000/api/articles/favorites', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (favoritesResponse.ok) {
        const data = await favoritesResponse.json();
        favorites.value = data.articles.map(article => ({
          id: article._id,
          title: article.title,
          content: article.content,
          authorName: article.creator.nickname,
          authorAvatar: article.creator.avatar,
          image: article.images && article.images.length > 0 ? article.images[0] : null,
          likes: article.likeCount || 0,
          comments: article.commentCount || 0,
          createdAt: article.createdAt
        }));
      }

      // 获取用户点赞的文章
      const likesResponse = await fetch('http://localhost:3000/api/articles/likes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (likesResponse.ok) {
        const data = await likesResponse.json();
        likes.value = data.articles.map(article => ({
          id: article._id,
          title: article.title,
          content: article.content,
          authorName: article.creator.nickname,
          authorAvatar: article.creator.avatar,
          image: article.images && article.images.length > 0 ? article.images[0] : null,
          likes: article.likeCount || 0,
          comments: article.commentCount || 0,
          createdAt: article.createdAt
        }));
      }
    } catch (err) {
      console.error('获取数据失败:', err);
      error.value = '获取数据失败，请重试';
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
