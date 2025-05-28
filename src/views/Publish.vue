<template>
  <div class="main-content">
    <div class="card">
      <h2 class="card-title">图文编辑 <span class="image-count">({{ images.length }}/9)</span></h2>
      <div class="image-upload-section">
        <div class="upload-box" @click="triggerImageInput">
          <img src="/assets/images/添加.svg" alt="添加" class="upload-icon">
          <span class="upload-text">添加</span>
          <input 
            type="file" 
            ref="imageInput" 
            accept="image/*" 
            multiple 
            style="display: none;"
            @change="handleImageSelect"
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

      <textarea 
        class="textarea-body" 
        v-model="content"
        placeholder="添加正文"
      ></textarea>

      <div class="options-row">
        <div class="option-tag">
          <img src="/assets/images/话题.svg" alt="话题" class="option-icon">
          <span>话题</span>
        </div>
        <div class="option-tag">
          <img src="/assets/images/艾特.svg" alt="用户" class="option-icon">
          <span>用户</span>
        </div>
        <div class="option-tag">
          <img src="/assets/images/定位.svg" alt="地点" class="option-icon">
          <span>地点</span>
        </div>
      </div>

      <div class="settings-row">
        <div class="setting-item">
          <img src="/assets/images/锁定.svg" alt="可见范围" class="setting-icon">
          <span>可见范围</span>
        </div>
        <div class="setting-item">
          <img src="/assets/images/齿轮.svg" alt="高级设置" class="setting-icon">
          <span>高级设置</span>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePublish } from '../scripts/publish'

const router = useRouter()
const imageInput = ref(null)
const title = ref('')
const content = ref('')
const isPublishing = ref(false)

const {
  images,
  triggerImageInput,
  handleImageSelect,
  removeImage,
  uploadImage,
  createArticle
} = usePublish(imageInput)

const handlePublish = async () => {
  // 表单验证
  if (!title.value.trim()) {
    alert('请输入文章标题')
    return
  }

  if (!content.value.trim()) {
    alert('请输入文章内容')
    return
  }

  // 从localStorage获取用户信息和token
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  const token = localStorage.getItem('token')
  
  if (!userInfo || !userInfo.id || !token) {
    alert('请先登录')
    return
  }

  try {
    isPublishing.value = true

    // 1. 先上传所有图片
    const uploadedImages = []
    for (const image of images.value) {
      try {
        const imageUrl = await uploadImage(image.file)
        uploadedImages.push({ imageUrl })
      } catch (error) {
        console.error('图片上传失败:', error)
        throw new Error('图片上传失败，请重试')
      }
    }

    // 2. 创建文章数据
    const articleData = {
      title: title.value,
      content: content.value,
      images: uploadedImages
    }

    // 3. 发布文章
    await createArticle(articleData)

    // 4. 发布成功
    alert('发布成功！')
    // 清空表单
    title.value = ''
    content.value = ''
    images.value = []
    // 跳转到首页
    router.push('/')

  } catch (error) {
    console.error('发布错误:', error)
    alert('发布失败：' + error.message)
  } finally {
    isPublishing.value = false
  }
}
</script>

<style scoped>
@import '../styles/publish.css';
</style> 