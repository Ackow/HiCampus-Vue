<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="profile-left">
        <div class="avatar-container">
          <img :src="userInfo.avatar" :alt="userInfo.nickname" class="profile-avatar">
        </div>
      </div>
      <div class="profile-right">
        <div class="profile-nickname-container">
          <h1 class="profile-nickname">{{ userInfo.nickname }}</h1>
          <a href="#" @click.prevent="editProfile">
            <img src="../../public/assets/images/编辑.svg" alt="编辑" class="edit-icon">
          </a>
        </div>
        <div class="profile-meta">
          <span>用户ID: {{ userInfo.userId }}</span>
          <span class="profile-tags">
            <img :src="userInfo.gender === 'male' ? '../../public/assets/images/男.svg' : '../../public/assets/images/女.svg'" 
                 :alt="userInfo.gender" 
                 class="profile-gender">
            {{ userInfo.age }}岁
          </span>
        </div>
      </div>
    </div>

    <div class="profile-tabs">
      <div v-for="tab in tabs" 
           :key="tab.id" 
           :class="['profile-tab', { active: currentTab === tab.id }]"
           @click="switchTab(tab.id)">
        {{ tab.name }}
      </div>
    </div>

    <div class="note-list">
      <div v-for="note in notes" 
           :key="note.id" 
           class="note-card"
           @click="handleNoteClick(note.id)">
        <img :src="note.coverImage" :alt="note.title" class="note-img">
        <h3 class="note-title">{{ note.title }}</h3>
        <div class="note-meta">
          <img :src="note.author.avatar" :alt="note.author.nickname">
          <span>{{ note.author.nickname }}</span>
          <span class="note-like">
            <i class="fas fa-heart"></i>
            {{ note.likes }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import '../styles/profile.css'

const router = useRouter()

// 用户信息
const userInfo = ref({
  userId: '123456',
  nickname: '校园达人',
  avatar: '@/assets/images/avatar.jpg',
  gender: 'male',
  age: 20
})

// 标签页数据
const tabs = [
  { id: 'notes', name: '笔记' },
  { id: 'favorites', name: '收藏' },
  { id: 'likes', name: '点赞' }
]

const currentTab = ref('notes')

// 笔记列表数据
const notes = ref([
  {
    id: 1,
    title: '校园生活分享',
    coverImage: '@/assets/images/note1.jpg',
    author: {
      nickname: '校园达人',
      avatar: '@/assets/images/avatar.jpg'
    },
    likes: 128
  },
  // 更多笔记数据...
])

// 切换标签页
const switchTab = (tabId) => {
  currentTab.value = tabId
  // TODO: 根据标签页加载对应数据
}

// 处理笔记点击
const handleNoteClick = (noteId) => {
  router.push(`/note/${noteId}`)
}

// 编辑个人资料
const editProfile = () => {
  // TODO: 实现编辑个人资料功能
}

onMounted(() => {
  // TODO: 加载用户数据和笔记列表
})
</script>
