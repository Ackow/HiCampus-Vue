<template>
  <div class="main-content">
    <div class="card">
      <h2 class="card-title">图文编辑 <span class="image-count">({{ images.length }}/9)</span></h2>
      <div class="image-upload-section">
        <div class="upload-box" @click="onAddClick">
          <img src="/assets/images/添加.svg" alt="添加" class="upload-icon">
          <span class="upload-text">添加</span>
          <input 
            type="file" 
            ref="imageInput" 
            accept="image/*,video/*" 
            multiple 
            style="display: none;"
            @change="onMediaSelect"
          >
        </div>
        <div class="image-preview-container">
          <!-- 视频预览 -->
          <div v-if="video" class="uploaded-video-placeholder">
            <video 
              :src="video.preview" 
              class="uploaded-video" 
              preload="metadata"
            ></video>
            <div class="video-overlay">
              <img src="/assets/images/播放.svg" alt="播放" class="play-icon">
              <span class="video-duration">{{ formatDuration(videoDuration) }}</span>
            </div>
            <img 
              src="/assets/images/删除.svg" 
              class="delete-btn" 
              alt="删除"
              @click.stop="removeVideo"
            >
          </div>
          <!-- 图片预览 -->
          <div 
            v-for="(image, index) in images" 
            :key="index" 
            class="uploaded-image-placeholder"
          >
            <img :src="image.preview" class="uploaded-image" alt="预览图片">
            <img 
              src="/assets/images/删除.svg" 
              class="delete-btn" 
              alt="删除"
              @click.stop="removeImage(index)"
            >
          </div>
        </div>
      </div>

      <input 
        type="text" 
        class="input-title" 
        v-model="title"
        placeholder="添加标题"
      >

      <div class="content-area">
        <textarea 
          class="textarea-body" 
          v-model="content"
          placeholder="添加正文"
        ></textarea>
      </div>

      <div class="options-row">
        <div class="option-tag" @click="showTopicSearch = true">
          <img src="/assets/images/话题.svg" alt="话题" class="option-icon">
          <span>话题</span>
          <span v-if="topics.length" class="tag-count">({{ topics.length }})</span>
          <!-- 话题选择弹窗 -->
          <div v-if="showTopicSearch" class="search-modal">
            <div class="modal-overlay" @click.stop="showTopicSearch = false"></div>
            <div class="search-popup" ref="topicSearchRef">
              <div class="search-header">
                <input 
                  type="text" 
                  v-model="topicQuery" 
                  placeholder="输入话题"
                  class="search-input"
                >
                <button class="close-btn" @click="showTopicSearch = false">×</button>
              </div>
              <div class="search-results">
                <div class="recommended-topics">
                  <div class="section-title">推荐话题</div>
                  <div 
                    v-for="topic in availableTopics" 
                    :key="topic"
                    class="topic-item"
                    @click="handleTopicSelect(topic)"
                  >
                    {{ topic }}
                  </div>
                </div>
                <div v-if="topicQuery" class="custom-topic">
                  <button 
                    class="add-custom-btn"
                    @click="addCustomTopic"
                  >
                    添加话题 "{{ topicQuery }}"
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="option-tag" @click="showUserSearch = true">
          <img src="/assets/images/艾特.svg" alt="用户" class="option-icon">
          <span>用户</span>
          <span v-if="mentions.length" class="tag-count">({{ mentions.length }})</span>
          <!-- 用户搜索弹窗 -->
          <div v-if="showUserSearch" class="search-modal">
            <div class="modal-overlay" @click.stop="showUserSearch = false"></div>
            <div class="search-popup" ref="userSearchRef">
              <div class="search-header">
                <input 
                  type="text" 
                  v-model="userQuery" 
                  @input="searchUsers($event.target.value)"
                  placeholder="输入用户名或学号搜索..."
                  class="search-input"
                >
                <button class="close-btn" @click="showUserSearch = false">×</button>
              </div>
              <div class="search-results">
                <div v-if="searchResults.length === 0 && userQuery" class="no-results">
                  未找到相关用户
                </div>
                <div 
                  v-for="user in searchResults" 
                  :key="user.id"
                  class="search-item"
                  @click="handleUserSelectWithInfo(user)"
                >
                  <div class="user-info">
                    <img 
                      :src="user.avatar || 'http://localhost:3000/uploads/avatars/default-avatar.jpg'" 
                      :alt="user.nickname || user.username"
                      class="user-avatar"
                    >
                    <div class="user-details">
                      <span class="user-name">{{ user.nickname || user.username }}</span>
                      <span class="user-id">{{ user.studentId || '未设置学号' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="option-tag" @click="showLocationSearch = true">
          <img src="/assets/images/定位.svg" alt="地点" class="option-icon">
          <span>地点</span>
          <span v-if="selectedLocation" class="tag-count">({{ selectedLocation.name }})</span>
          <!-- 地点选择弹窗 -->
          <div v-if="showLocationSearch" class="search-modal">
            <div class="modal-overlay" @click.stop="showLocationSearch = false"></div>
            <div class="search-popup" ref="locationSearchRef">
              <div class="search-header">
                <input 
                  type="text" 
                  v-model="locationQuery" 
                  @input="searchLocation($event.target.value)"
                  placeholder="搜索地点..."
                  class="search-input"
                >
                <button class="close-btn" @click.stop="locationQuery = ''">×</button>
              </div>
              <div class="search-results">
                <div v-if="locationResults && locationResults.length > 0" class="location-results-list">
                  <div 
                    v-for="location in locationResults" 
                    :key="location.id"
                    class="search-item"
                    @click="handleLocationSelect(location)"
                  >
                    <div class="location-info">
                      <div class="location-name">{{ location.name }}</div>
                      <div class="location-address">{{ location.address }}</div>
                    </div>
                  </div>
                </div>
                <div v-else-if="locationQuery" class="no-results">
                  未找到相关地点
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="isAdmin" class="option-tag" @click="showAdminMentionSearch = true">
          <img src="/assets/images/艾特.svg" alt="管理员艾特" class="option-icon">
          <span>管理员艾特</span>
          <span v-if="adminMentions.length" class="tag-count">({{ adminMentions.length }})</span>
          <!-- 管理员艾特弹窗 -->
          <div v-if="showAdminMentionSearch" class="search-modal">
            <div class="modal-overlay" @click.stop="showAdminMentionSearch = false"></div>
            <div class="search-popup" ref="adminMentionSearchRef">
              <div class="search-header">
                <div class="admin-mention-options">
                  <button 
                    class="admin-mention-btn"
                    :class="{ active: adminMentionType === 'all' }"
                    @click="handleAdminMentionType('all')"
                  >
                    艾特所有用户
                  </button>
                  <button 
                    class="admin-mention-btn"
                    :class="{ active: adminMentionType === 'college' }"
                    @click="handleAdminMentionType('college')"
                  >
                    艾特特定学院
                  </button>
                </div>
              </div>
              <div v-if="adminMentionType === 'college'" class="search-results">
                <div class="college-list">
                  <div 
                    v-for="college in collegeList" 
                    :key="college"
                    class="college-item"
                    @click="handleCollegeSelect(college)"
                  >
                    <span class="college-name">{{ college }}</span>
                    <button class="add-college-btn">添加</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 统一显示所有选中项目的栏位 -->
      <div v-if="hasSelectedItems" class="selected-items-container">
        <!-- 话题标签 -->
        <div v-for="topic in topics" :key="topic" class="item-tag topic-tag">
          <img src="/assets/images/话题.svg" alt="话题" class="item-icon">
          <span>{{ topic }}</span>
          <button class="remove-item" @click="removeTopic(topic)">×</button>
        </div>
        <!-- 用户艾特标签 -->
        <div v-for="user in mentionedUsers" :key="user.id" class="item-tag mention-tag">
          <img src="/assets/images/艾特.svg" alt="用户" class="item-icon">
          <span>{{ user.nickname }}</span>
          <button class="remove-item" @click="removeMentionWithInfo(user.id)">×</button>
        </div>
        <!-- 管理员艾特标签 -->
        <div v-for="mention in adminMentions" :key="mention" class="item-tag admin-tag">
          <img src="/assets/images/艾特.svg" alt="管理员艾特" class="item-icon">
          <span>{{ mention === 'all_users' ? '所有用户' : mention.replace('college:', '') }}</span>
          <button class="remove-item" @click="removeAdminMention(mention)">×</button>
        </div>
        <!-- 地点标签 -->
        <div v-if="selectedLocation" class="item-tag location-tag">
          <img src="/assets/images/定位.svg" alt="地点" class="item-icon">
          <span>{{ selectedLocation.name }}</span>
          <button class="remove-item" @click="removeLocation">×</button>
        </div>
      </div>

      <div class="publish-button-container">
        <button 
          class="publish-btn" 
          :disabled="isPublishing"
          @click="handlePublish"
        >
          {{ isPublishing ? '发布中...' : '发布' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePublish } from '../scripts/publish'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { collegeOptions } from '../data/colleges'

const imageInput = ref(null)
const showLocationSearch = ref(false)
const locationQuery = ref('')
const locationSearchRef = ref(null)
const mentionedUsers = ref([])

// 生成随机渐变色
const generateGradientColors = () => {
  const colors = [
    ['#FFE5E5', '#FFD6D6'], // 浅粉色
    ['#E5F6FF', '#D6F0FF'], // 浅蓝色
    ['#E5FFE5', '#D6FFD6'], // 浅绿色
    ['#FFF5E5', '#FFEED6'], // 浅橙色
    ['#F5E5FF', '#EED6FF'], // 浅紫色
    ['#E5FFE5', '#D6FFD6'], // 浅青色
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// 生成带标题的渐变背景图片
const generateTitleImage = async (title) => {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');

  // 创建渐变背景
  const [color1, color2] = generateGradientColors();
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 添加标题文字
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 文字换行处理
  const maxWidth = canvas.width - 80;
  const words = title.split('');
  let line = '';
  let lines = [];
  let y = canvas.height / 2 - 40;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i];
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && i > 0) {
      lines.push(line);
      line = words[i];
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  // 绘制文字
  lines.forEach((line, index) => {
    ctx.fillText(line, canvas.width / 2, y + (index * 60));
  });

  // 将canvas转换为Blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
};

// 上传图片到服务器
const uploadImage = async (imageBlob) => {
  const formData = new FormData();
  // 生成带时间戳的文件名，不添加后缀
  const timestamp = new Date().getTime();
  const filename = `image-${timestamp}-${Math.floor(Math.random() * 1000000000)}`;
  formData.append('image', imageBlob, filename);

  try {
    const response = await fetch('http://localhost:3000/api/upload/image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('图片上传失败');
    }

    const data = await response.json();
    return data.filename;
  } catch (error) {
    console.error('上传图片失败:', error);
    throw error;
  }
};

const {
  title,
  content,
  images,
  video,
  videoThumbnail,
  videoDuration,
  mentions,
  topics,
  searchResults,
  showTopicSearch,
  showUserSearch,
  topicQuery,
  userQuery,
  availableTopics,
  isPublishing,
  topicSearchRef,
  userSearchRef,
  triggerImageInput,
  handleImageSelect,
  handleVideoSelect,
  removeImage,
  removeVideo,
  addMention,
  removeMention,
  addTopic,
  removeTopic,
  searchUsers,
  handleUserSelect,
  handleTopicSelect,
  addCustomTopic,
  handleClickOutside,
  handlePublish: originalHandlePublish,
  searchLocation,
  handleLocationSelect,
  removeLocation,
  locationResults,
  selectedLocation,
  isAdmin
} = usePublish()

const showAdminMentionSearch = ref(false)
const adminMentionSearchRef = ref(null)
const adminMentionType = ref('all')
const collegeQuery = ref('')
const collegeResults = ref([])
const adminMentions = ref([])

// 使用统一的学院列表
const collegeList = collegeOptions

// 处理管理员艾特类型选择
const handleAdminMentionType = (type) => {
  adminMentionType.value = type
  if (type === 'all') {
    // 艾特所有用户
    adminMentions.value = ['all_users']
    showAdminMentionSearch.value = false
  } else {
    // 清空之前的艾特
    adminMentions.value = []
  }
}

// 处理学院选择
const handleCollegeSelect = (college) => {
  const mention = `college:${college}`
  if (!adminMentions.value.includes(mention)) {
    adminMentions.value.push(mention)
  }
  showAdminMentionSearch.value = false
}

// 修改发布处理函数
const handlePublish = async () => {
  try {
    // 如果没有上传图片，生成封面图片
    if (images.value.length === 0) {
      const coverImageBlob = await generateTitleImage(title.value)
      images.value.push({
        file: coverImageBlob,
        preview: URL.createObjectURL(coverImageBlob)
      })
    }
    
    // 添加管理员艾特信息到发布数据
    const publishData = {
      title: title.value,
      content: content.value,
      images: images.value,
      topics: topics.value,
      mentions: mentions.value,
      location: selectedLocation.value,
      adminMentions: adminMentions.value || [] // 确保adminMentions有默认值
    }
    
    // 调用原始的发布函数
    const result = await originalHandlePublish(publishData)

    if (result && result.success) {
      alert('发布成功！')
      // 清空表单
      title.value = ''
      content.value = ''
      images.value = []
      mentions.value = []
      topics.value = []
      selectedLocation.value = null
      adminMentions.value = [] // 清空adminMentions
      // 跳转到首页
      router.push('/')
    } else {
      throw new Error(result.message || '发布失败')
    }
  } catch (error) {
    console.error('发布失败:', error)
    alert(error.message || '发布失败，请重试')
  }
}

// 格式化视频时长
const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 处理媒体选择（图片或视频）
const onMediaSelect = (event) => {
  const files = event.target.files
  if (!files) return

  Array.from(files).forEach(file => {
    if (file.type.startsWith('video/')) {
      // 处理视频文件
      if (video.value) {
        alert('只能上传一个视频')
        return
      }

      // 验证文件大小（20MB限制）
      if (file.size > 20 * 1024 * 1024) {
        alert('视频大小不能超过20MB')
        return
      }

      // 创建视频预览
      const videoUrl = URL.createObjectURL(file)
      const videoElement = document.createElement('video')
      videoElement.src = videoUrl

      videoElement.onloadedmetadata = () => {
        videoDuration.value = videoElement.duration
      }

      // 生成视频缩略图
      videoElement.onseeked = () => {
        const canvas = document.createElement('canvas')
        canvas.width = videoElement.videoWidth
        canvas.height = videoElement.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
        videoThumbnail.value = canvas.toDataURL('image/jpeg')
      }

      videoElement.currentTime = 1 // 设置到1秒处生成缩略图

      video.value = {
        file: file,
        preview: videoUrl
      }
    } else if (file.type.startsWith('image/')) {
      // 处理图片文件
      if (images.value.length >= 9) {
        alert('最多只能上传9张图片')
        return
      }

      // 验证文件大小（5MB限制）
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB')
        return
      }

      // 创建预览
      const reader = new FileReader()
      reader.onload = (e) => {
        images.value.push({
          file: file,
          preview: e.target.result
        })
      }
      reader.readAsDataURL(file)
    }
  })

  // 清空input，允许重复选择同一文件
  event.target.value = ''
}

// 处理点击添加按钮
const onAddClick = () => {
  console.log('添加按钮点击')
  if (imageInput.value) {
    imageInput.value.click()
  } else {
    console.error('imageInput 引用未找到')
  }
}

// 添加删除管理员艾特的函数
const removeAdminMention = (mention) => {
  adminMentions.value = adminMentions.value.filter(m => m !== mention)
}

// 添加计算属性判断是否有选中的项目
const hasSelectedItems = computed(() => {
  return topics.value.length > 0 || 
         mentions.value.length > 0 || 
         adminMentions.value.length > 0 || 
         selectedLocation.value
})

// 修改handleUserSelect函数
const handleUserSelectWithInfo = (user) => {
  handleUserSelect(user)
  // 保存用户信息用于显示
  if (!mentionedUsers.value.find(u => u.id === user.id)) {
    mentionedUsers.value.push({
      id: user.id,
      nickname: user.nickname || user.username,
      avatar: user.avatar
    })
  }
}

// 修改removeMention函数
const removeMentionWithInfo = (userId) => {
  removeMention(userId)
  mentionedUsers.value = mentionedUsers.value.filter(user => user.id !== userId)
}

// 初始化路由
const router = useRouter()
</script>

<style scoped>
@import '../styles/publish.css';


</style> 