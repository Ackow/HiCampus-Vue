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
      userInfo.value = auth.getUserInfo();
      console.log('获取到的用户信息:', userInfo.value);
      
      if (userInfo.value) {
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
