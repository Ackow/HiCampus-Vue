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
              <img src="/assets/images/爱心.svg" alt="爱心" class="btn-icon">
              <span class="likes-number">{{ postDetail.likeCount || 0 }}</span>
            </div>
            <div class="collect-count">
              <img src="/assets/images/收藏.svg" alt="收藏" class="btn-icon">
              <span class="collect-number">{{ postDetail.collectCount || 0 }}</span>
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
import { ref } from 'vue'
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

const emit = defineEmits(['close', 'toggle-like', 'comment-added'])

// 图片预览相关状态
const showImagePreview = ref(false)
const previewImageIndex = ref(0)

// 打开图片预览
const openImagePreview = (index) => {
  previewImageIndex.value = index
  showImagePreview.value = true
}

// 关闭图片预览
const closeImagePreview = () => {
  showImagePreview.value = false
}

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
  toggleLike,
  submitComment
} = usePostDetail(props, emit)
</script>

<style scoped>
@import '../styles/postDetail.css';

.detail-image {
  cursor: zoom-in;
}
</style> 