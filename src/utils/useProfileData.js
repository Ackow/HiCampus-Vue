// src/composables/useProfileData.js
import { ref, computed } from 'vue'
import { useAuth } from './useAuth.js'

export function useProfileData() {
  const auth = useAuth();

  const userInfo = ref({});
  const notes = ref([]);
  const favorites = ref([]);
  const likes = ref([]);
  const activeTab = ref('notes');

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
    console.log('初始化个人信息数据');
    try {
      // 从本地存储获取基本信息
      userInfo.value = auth.getUserInfo();
      console.log('本地存储的用户信息:', userInfo.value);
      
      if (userInfo.value) {
        try {
          // 从服务器获取最新用户信息
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('未找到认证token');
            return;
          }

          const response = await fetch('http://localhost:3000/api/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            credentials: 'include'
          });

          console.log('获取用户信息响应状态:', response.status);
          if (response.ok) {
            const data = await response.json();
            console.log('服务器返回的用户信息:', data);
            if (data.user) {
              // 确保头像URL是完整的
              const userData = {
                ...data.user,
                avatar: data.user.avatar || 'http://localhost:3000/uploads/avatars/default-avatar.jpg'
              };
              userInfo.value = userData;
              // 更新本地存储
              localStorage.setItem('userInfo', JSON.stringify(userData));
            }
          } else {
            console.error('获取用户信息失败:', response.status);
            // 如果获取失败，继续使用本地存储的数据
            console.log('使用本地存储的用户信息');
          }
        } catch (error) {
          console.error('获取用户信息出错:', error);
          // 如果出错，继续使用本地存储的数据
          console.log('使用本地存储的用户信息');
        }

        // 获取用户相关数据
        notes.value = await fetchNotes();
        favorites.value = await fetchFavorites();
        likes.value = await fetchLikes();
      }
    } catch (error) {
      console.error('初始化数据失败:', error);
    }
  };

  const fetchNotes = async () => {
    return [
      {
        id: 1,
        title: '3D场景建模',
        image: '3d-scene.jpg',
        authorAvatar: 'author-avatar.jpg',
        authorName: '想喝冰阔乐',
        likes: 2
      }
    ];
  };

  const fetchFavorites = async () => {
    return [];
  };

  const fetchLikes = async () => {
    return [];
  };

  // 返回需要暴露的状态和方法
  return {
    userInfo,
    notes,
    favorites,
    likes,
    activeTab,
    getNotesByTab,
    initData
  };
}
