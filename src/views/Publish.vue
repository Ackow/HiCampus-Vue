<template>
  <div class="publish-page">
    <SiteHeader />
    <div class="main-content">
      <div class="card">
        <h2 class="card-title">图文编辑 <span class="image-count">({{ uploadedImages.length }}/9)</span></h2>
        
        <div class="image-upload-section">
          <div class="upload-box" @click="triggerFileInput" v-if="uploadedImages.length < 9">
            <img src="../../public/assets/images/添加.svg" alt="添加" class="upload-icon">
            <span class="upload-text">添加</span>
            <input 
              type="file" 
              ref="fileInput" 
              accept="image/*" 
              multiple 
              style="display: none"
              @change="handleFileUpload"
            >
          </div>
          
          <div class="image-preview-container">
            <div 
              v-for="(image, index) in uploadedImages" 
              :key="index" 
              class="uploaded-image-placeholder"
            >
              <img :src="image.url" :alt="'预览图片 ' + (index + 1)" class="uploaded-image">
              <img 
                src="../../public/assets/images/删除.svg" 
                alt="删除" 
                class="delete-btn"
                @click="removeImage(index)"
              >
            </div>
          </div>
        </div>

        <input 
          type="text" 
          class="input-title" 
          placeholder="添加标题"
          v-model="title"
        >

        <textarea 
          class="textarea-body" 
          placeholder="添加正文"
          v-model="content"
        ></textarea>

        <div class="options-row">
          <div class="option-tag" @click="showTopicSelector">
            <img src="../../public/assets/images/话题.svg" alt="话题" class="option-icon">
            <span>话题</span>
          </div>
          <div class="option-tag" @click="showUserMention">
            <img src="../../public/assets/images/艾特.svg" alt="用户" class="option-icon">
            <span>用户</span>
          </div>
          <div class="option-tag" @click="showLocationPicker">
            <img src="../../public/assets/images/定位.svg" alt="地点" class="option-icon">
            <span>地点</span>
          </div>
        </div>

        <div class="settings-row">
          <div class="setting-item" @click="showVisibilitySettings">
            <img src="../../public/assets/images/锁定.svg" alt="可见范围" class="setting-icon">
            <span>可见范围</span>
          </div>
          <div class="setting-item" @click="showAdvancedSettings">
            <img src="../../public/assets/images/齿轮.svg" alt="高级设置" class="setting-icon">
            <span>高级设置</span>
          </div>
        </div>

        <div class="publish-button-container">
          <button 
            class="publish-btn" 
            @click="handlePublish"
            :disabled="!canPublish"
          >
            发布
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import SiteHeader from '../components/SiteHeader.vue'

const router = useRouter()
const fileInput = ref(null)
const title = ref('')
const content = ref('')
const uploadedImages = ref([])

const canPublish = computed(() => {
  return title.value.trim() !== '' && content.value.trim() !== ''
})

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileUpload = (event) => {
  const files = event.target.files
  if (files.length + uploadedImages.value.length > 9) {
    alert('最多只能上传9张图片')
    return
  }

  Array.from(files).forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        uploadedImages.value.push({
          file,
          url: e.target.result
        })
      }
      reader.readAsDataURL(file)
    }
  })
}

const removeImage = (index) => {
  uploadedImages.value.splice(index, 1)
}

const showTopicSelector = () => {
  // TODO: 实现话题选择功能
  console.log('选择话题')
}

const showUserMention = () => {
  // TODO: 实现@用户功能
  console.log('@用户')
}

const showLocationPicker = () => {
  // TODO: 实现位置选择功能
  console.log('选择位置')
}

const showVisibilitySettings = () => {
  // TODO: 实现可见范围设置
  console.log('设置可见范围')
}

const showAdvancedSettings = () => {
  // TODO: 实现高级设置
  console.log('高级设置')
}

const handlePublish = async () => {
  if (!canPublish.value) return

  try {
    // TODO: 实现发布逻辑
    const formData = new FormData()
    formData.append('title', title.value)
    formData.append('content', content.value)
    uploadedImages.value.forEach((image, index) => {
      formData.append(`image${index}`, image.file)
    })

    // 模拟发布请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 发布成功后跳转到首页
    router.push('/')
  } catch (error) {
    console.error('发布失败:', error)
    alert('发布失败，请重试')
  }
}
</script>

<style scoped>
@import '../styles/publish.css';

.publish-page {
  min-height: 100vh;
  background-color: #F8F8F8;
}

.main-content {
  margin-top: 80px;
  padding-top: 20px;
}
</style>
