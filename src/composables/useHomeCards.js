// src/composables/useHomeCards.js
import { ref } from 'vue'

export const cards = ref([
  {
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    title: '校园生活分享',
    description: '分享你的校园生活点滴，记录美好时光...',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    username: '小明',
    likes: 128,
    comments: 32
  },
  {
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    title: '学习交流',
    description: '和同学们一起讨论学习心得，互帮互助。',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    username: '小红',
    likes: 98,
    comments: 21
  },
  {
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    title: '社团活动',
    description: '参加丰富多彩的社团活动，结识更多朋友。',
    avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
    username: '小刚',
    likes: 76,
    comments: 15
  }
])