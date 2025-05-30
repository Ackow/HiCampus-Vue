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
                <span v-else>暂无评论</span>
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
            <div class="likes-count" @click="toggleLike">
              <img :src="isLiked ? '/assets/images/爱心-红.svg' : '/assets/images/爱心.svg'" 
                   :alt="isLiked ? '已点赞' : '未点赞'" 
                   class="btn-icon"
                   :class="{ 'liked': isLiked }">
              <span class="likes-number" :class="{ 'liked': isLiked }">{{ likeCount }}</span>
            </div>
            <div class="collect-count" @click="toggleCollect">
              <img :src="isCollected ? '/assets/images/收藏-黄.svg' : '/assets/images/收藏.svg'" 
                   :alt="isCollected ? '已收藏' : '未收藏'" 
                   class="btn-icon"
                   :class="{ 'collected': isCollected }">
              <span class="collect-number" :class="{ 'collected': isCollected }">{{ collectCount }}</span>
            </div>
            <div class="comments-count">
              <img src="/assets/images/评论.svg" alt="评论" class="btn-icon">
              <span class="comments-number">{{ comments.length }}</span>
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

// 检查点赞状态
const checkLikeStatus = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/articles/${props.postDetail.id}/like-status`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (response.ok) {
      const data = await response.json()
      isLiked.value = data.isLiked
      likeCount.value = data.likeCount || 0
    }
  } catch (error) {
    console.error('获取点赞状态失败:', error)
  }
}

// 切换点赞状态
const toggleLike = async () => {
  if (!localStorage.getItem('token')) {
    alert('请先登录')
    return
  }

  try {
    const method = isLiked.value ? 'DELETE' : 'POST'
    const response = await fetch(`http://localhost:3000/api/articles/${props.postDetail.id}/like`, {
      method,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      isLiked.value = !isLiked.value
      likeCount.value = data.likeCount
      // 更新父组件中的点赞数
      emit('update-like-count', data.likeCount)
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    alert('操作失败，请稍后重试')
  }
}

// 检查收藏状态
const checkCollectStatus = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/articles/${props.postDetail.id}/collect-status`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (response.ok) {
      const data = await response.json()
      isCollected.value = data.isCollected
      collectCount.value = data.collectCount || 0
    }
  } catch (error) {
    console.error('获取收藏状态失败:', error)
  }
}

// 切换收藏状态
const toggleCollect = async () => {
  if (!localStorage.getItem('token')) {
    alert('请先登录')
    return
  }

  try {
    const method = isCollected.value ? 'DELETE' : 'POST'
    const response = await fetch(`http://localhost:3000/api/articles/${props.postDetail.id}/collect`, {
      method,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      isCollected.value = !isCollected.value
      collectCount.value = data.collectCount
      // 更新父组件中的收藏数
      emit('updateCollectCount', {
        articleId: props.postDetail.id,
        collectCount: data.collectCount,
        isCollected: isCollected.value
      })
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    alert('操作失败，请稍后重试')
  }
}

// 监听 show 属性变化
watch(() => props.show, async (newVal) => {
  if (newVal) {
    await checkLikeStatus()
    await checkCollectStatus()
  }
})

// 监听 postDetail 变化
watch(() => props.postDetail, async (newVal) => {
  if (newVal) {
    // 当文章详情变化时，重新获取点赞和收藏状态
    await checkLikeStatus()
    await checkCollectStatus()
  }
}, { immediate: true })

// 在获取文章详情后检查点赞状态
onMounted(async () => {
  await checkLikeStatus()
  await checkCollectStatus()
})
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