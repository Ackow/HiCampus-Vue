<template>
  <Teleport to="body">
    <Transition name="fade">
      <div class="post-detail-overlay" v-if="show" @click.self="closeDetail">
        <div class="post-detail-card-standalone">
          <button class="close-card-btn" @click="closeDetail">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="detail-header">
            <div class="user-info">
              <img :src="postDetail.avatar" alt="User Avatar" class="detail-avatar">
              <span class="detail-username">{{ postDetail.username }}</span>
            </div>
            <button class="more-options-btn">...</button>
          </div>

          <div class="detail-content">
            <div class="detail-image-container">
              <button class="image-nav-btn prev-btn" v-if="currentImageIndex > 0" @click="prevSlide">
                <img src="/assets/images/翻页1.svg" alt="left" class="image-nav-btn-icon">
              </button>
              <div class="image-slider">
                <img 
                  v-for="(image, index) in postDetail.images" 
                  :key="index"
                  :src="image" 
                  :alt="'Post Image ' + (index + 1)" 
                  class="detail-image"
                  :class="{ active: currentImageIndex === index }"
                  @click="openImagePreview(index)"
                >
              </div>
              <button class="image-nav-btn next-btn" v-if="currentImageIndex < postDetail.images.length - 1" @click="nextSlide">
                <img src="/assets/images/翻页2.svg" alt="right" class="image-nav-btn-icon">
              </button>
              <div class="image-indicators">
                <div 
                  v-for="(_, index) in postDetail.images" 
                  :key="index"
                  class="indicator"
                  :class="{ active: currentImageIndex === index }"
                  @click="goToSlide(index)"
                ></div>
              </div>
            </div>

            <div class="detail-body">
              <div class="post-text-content">
                <p class="post-title">{{ postDetail.title }}</p>
                <p class="post-description">{{ postDetail.description }}</p>
              </div>

              <div class="comments-section">
                <div v-if="comments.length > 0">
                  <div v-for="comment in comments" :key="comment._id" class="comment-item">
                    <img 
                      :src="`http://localhost:3000/uploads/avatars/${comment.commenter.avatar}`" 
                      alt="Commenter Avatar" 
                      class="comment-avatar"
                      @error="handleAvatarError"
                    >
                    <div class="comment-content">
                      <div class="comment-header">
                        <span class="comment-username">{{ comment.commenter.nickname }}</span>
                        <span class="comment-time">{{ new Date(comment.createdAt).toLocaleString() }}</span>
                      </div>
                      <p class="comment-text">{{ comment.content }}</p>
                    </div>
                  </div>
                </div>
                <span class="no-comment" v-else>暂无评论</span>
              </div>
            </div>
          </div>

          <div class="detail-actions">
            <div class="comment-input-box">
              <input 
                type="text" 
                v-model="commentContent" 
                placeholder="说点什么..." 
                @keyup.enter="submitComment"
                ref="commentInput"
              >
              <button 
                class="send-btn" 
                v-show="commentContent.trim()" 
                @click="submitComment"
                :disabled="isLoading"
              >
                {{ isLoading ? '发送中...' : '发送' }}
              </button>
            </div>
            <div class="likes-count" :class="{ 'liked': isLiked }" @click="toggleLike">
              <img :src="isLiked ? '/assets/images/爱心-红.svg' : '/assets/images/爱心.svg'" 
                   :alt="isLiked ? '已点赞' : '未点赞'" 
                   class="btn-icon">
              <span>{{ likeCount }}</span>
            </div>
            <div class="collect-count" :class="{ 'collected': isCollected }" @click="toggleCollect">
              <img :src="isCollected ? '/assets/images/收藏-黄.svg' : '/assets/images/收藏.svg'" 
                   :alt="isCollected ? '已收藏' : '未收藏'" 
                   class="btn-icon">
              <span>{{ collectCount }}</span>
            </div>
            <div class="comments-count">
              <img src="/assets/images/评论.svg" alt="评论" class="btn-icon">
              <span>{{ comments.length }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- 图片预览组件 -->
  <ImagePreview
    :show="showImagePreview"
    :images="postDetail.images"
    :initial-index="previewImageIndex"
    @close="closeImagePreview"
  />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { usePostDetail } from '../scripts/postDetail'
import ImagePreview from '../components/ImagePreview.vue'
import { useAuth } from '../utils/useAuth'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  postDetail: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  'close',
  'toggle-like',
  'comment-added',
  'update-like-count',
  'updateCollectCount'
])

// 图片预览相关状态
const previewImageIndex = ref(0)
const showImagePreview = ref(false)

// 点赞状态
const isLiked = ref(false)
const likeCount = ref(0)

// 收藏状态
const isCollected = ref(false)
const collectCount = ref(0)

const auth = useAuth()

const {
  currentImageIndex,
  commentContent,
  comments,
  isLoading,
  closeDetail,
  handleAvatarError,
  prevSlide,
  nextSlide,
  goToSlide,
  submitComment
} = usePostDetail(props, emit)

// 打开图片预览
const openImagePreview = (index) => {
  previewImageIndex.value = index
  showImagePreview.value = true
}

// 关闭图片预览
const closeImagePreview = () => {
  showImagePreview.value = false
}

const checkLikeStatus = async () => {
  if (!isLoggedIn()) {
    console.log('用户未登录，使用初始点赞数据')
    isLiked.value = false
    return
  }

  try {
    const url = `http://localhost:3000/api/articles/${props.postDetail.id}/like-status`
    console.log('检查点赞状态:', url)

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || '获取点赞状态失败')
    }

    const data = await response.json()
    console.log('获取到的点赞状态:', data)

    isLiked.value = data.isLiked
    likeCount.value = data.likeCount
  } catch (error) {
    console.error('检查点赞状态失败:', error)
    // 保持当前状态不变
  }
}

// 检查是否已登录
const isLoggedIn = () => {
  return !!localStorage.getItem('token')
}

// 检查收藏状态
const checkCollectStatus = async () => {
  if (!isLoggedIn()) {
    console.log('用户未登录，使用初始收藏数据')
    isCollected.value = false
    return
  }

  try {
    const url = `http://localhost:3000/api/articles/${props.postDetail.id}/collect-status`
    console.log('检查收藏状态:', url)

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || '获取收藏状态失败')
    }

    const data = await response.json()
    console.log('获取到的收藏状态:', data)

    isCollected.value = data.isCollected
    collectCount.value = data.collectCount
  } catch (error) {
    console.error('检查收藏状态失败:', error)
    // 保持当前状态不变
  }
}

// 切换收藏状态
const toggleCollect = async () => {
  if (!isLoggedIn()) {
    alert('请先登录')
    return
  }

  try {
    const method = isCollected.value ? 'DELETE' : 'POST'
    const url = `http://localhost:3000/api/articles/${props.postDetail.id}/collect`
    console.log('发送收藏请求:', { method, url, currentState: isCollected.value })

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    console.log('收藏操作响应:', data)

    if (!response.ok) {
      throw new Error(data.message || '收藏操作失败')
    }

    // 更新状态
    isCollected.value = !isCollected.value
    collectCount.value = data.collectCount

    // 更新父组件中的收藏数
    emit('updateCollectCount', {
      articleId: props.postDetail.id,
      collectCount: data.collectCount,
      isCollected: isCollected.value
    })
  } catch (error) {
    console.error('收藏操作失败:', error)
    // 如果是因为已经收藏/取消收藏导致的错误，重新获取状态
    if (error.message.includes('已经收藏过了') || error.message.includes('还没有收藏')) {
      await checkCollectStatus()
    } else {
      alert(error.message || '操作失败，请稍后重试')
    }
  }
}

// 初始化点赞和收藏数据
const initLikeAndCollectData = () => {
  console.log('初始化点赞和收藏数据:', props.postDetail)
  // 使用传入的数据初始化
  likeCount.value = props.postDetail.likeCount || 0
  collectCount.value = props.postDetail.collectCount || 0
  isLiked.value = props.postDetail.isLiked || false
  isCollected.value = props.postDetail.isCollected || false
  
  console.log('初始化后的数据:', {
    likeCount: likeCount.value,
    collectCount: collectCount.value,
    isLiked: isLiked.value,
    isCollected: isCollected.value
  })
}

// 监听文章详情变化
watch(() => props.postDetail, (newVal) => {
  if (newVal) {
    console.log('文章详情更新:', newVal)
    // 先初始化数据
    initLikeAndCollectData()
    
    // 只有在用户登录的情况下才检查状态
    if (isLoggedIn()) {
      console.log('用户已登录，检查最新状态')
      checkLikeStatus()
      checkCollectStatus()
    } else {
      console.log('用户未登录，使用初始数据')
    }
  }
}, { immediate: true })

// 监听登录状态变化
watch(() => localStorage.getItem('token'), (newToken) => {
  if (newToken && props.postDetail) {
    console.log('用户登录状态变化，重新检查状态')
    checkLikeStatus()
    checkCollectStatus()
  }
})

// 切换点赞状态
const toggleLike = async () => {
  if (!isLoggedIn()) {
    alert('请先登录')
    return
  }

  try {
    const method = isLiked.value ? 'DELETE' : 'POST'
    const url = `http://localhost:3000/api/articles/${props.postDetail.id}/like`
    console.log('发送点赞请求:', { method, url, currentState: isLiked.value })

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    console.log('点赞操作响应:', data)

    if (!response.ok) {
      throw new Error(data.message || '点赞操作失败')
    }

    // 更新状态
    isLiked.value = !isLiked.value
    likeCount.value = data.likeCount

    // 更新父组件中的点赞数
    emit('update-like-count', {
      articleId: props.postDetail.id,
      likeCount: data.likeCount,
      isLiked: isLiked.value
    })
  } catch (error) {
    console.error('点赞操作失败:', error)
    // 如果是因为已经点赞/取消点赞导致的错误，重新获取状态
    if (error.message.includes('已经点赞过了') || error.message.includes('还没有点赞')) {
      await checkLikeStatus()
    } else {
      alert(error.message || '操作失败，请稍后重试')
    }
  }
}
</script>

<style scoped>
@import '../styles/postDetail.css';

.detail-image {
  cursor: zoom-in;
}

.collect-count {
  cursor: pointer;
  transition: all 0.3s ease;
}

.collect-count:hover {
  transform: scale(1.1);
}
</style> 