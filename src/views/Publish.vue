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
            accept="image/*" 
            multiple 
            style="display: none;"
            @change="onImageSelect"
          >
        </div>
        <div class="image-preview-container">
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
            <div class="search-popup" ref="topicSearchRef">
              <div class="search-header">
                <input 
                  type="text" 
                  v-model="topicQuery" 
                  placeholder="输入话题，例如：校园生活、学习交流..."
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
                  @click="handleUserSelect(user)"
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
      </div>
  
      <!-- <div class="settings-row">
        <div class="setting-item">
          <img src="/assets/images/锁定.svg" alt="可见范围" class="setting-icon">
          <span>可见范围</span>
        </div>
        <div class="setting-item">
          <img src="/assets/images/齿轮.svg" alt="高级设置" class="setting-icon">
          <span>高级设置</span>
        </div>
      </div> -->

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
import { ref } from 'vue'

const imageInput = ref(null)
const showLocationSearch = ref(false)
const locationQuery = ref('')
const locationSearchRef = ref(null)

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
  removeImage,
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
  selectedLocation
} = usePublish()

// 发布处理函数
const handlePublish = async () => {
  try {
    // 如果没有上传图片，生成封面图片
    if (images.value.length === 0) {
      const coverImageBlob = await generateTitleImage(title.value);
      // 直接调用原始的发布函数，让它处理图片上传
      images.value.push({
        file: coverImageBlob,
        preview: URL.createObjectURL(coverImageBlob)
      });
    }
    
    // 调用原始的发布函数
    await originalHandlePublish();
  } catch (error) {
    console.error('发布失败:', error);
    alert('发布失败，请重试');
  }
};

// 处理图片选择
const onImageSelect = (event) => {
  console.log('图片选择事件触发')
  handleImageSelect(event)
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
</script>

<style scoped>
@import '../styles/publish.css';

.content-area {
  position: relative;
  width: 100%;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: transparent;
  z-index: 999;
  cursor: default;
}

.search-modal {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  z-index: 1000;
  margin-top: 8px;
}

.search-popup {
  position: relative;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
}

.location-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
  z-index: 1000;
}

.location-results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.location-results-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.close-results {
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.location-results-list {
  max-height: 300px;
  overflow-y: auto;
}

.location-result-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.location-result-item:hover {
  background-color: #f5f5f5;
}

.location-result-item:last-child {
  border-bottom: none;
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.location-name {
  font-weight: 500;
  color: #333;
}

.location-address {
  font-size: 0.9em;
  color: #666;
}

.location-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8em;
  color: #999;
}

.location-distance {
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 10px;
  color: #666;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-right: 8px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.search-results {
  max-height: 300px;
  overflow-y: auto;
}

.search-item {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-item:hover {
  background-color: #f5f5f5;
}

.no-results {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

/* 确保选项标签容器是相对定位 */
.option-tag {
  position: relative;
}
</style> 