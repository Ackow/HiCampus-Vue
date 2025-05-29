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
                <i class="fas fa-chevron-left"></i>
              </button>
              <div class="image-slider">
                <img 
                  v-for="(image, index) in postDetail.images" 
                  :key="index"
                  :src="image" 
                  :alt="'Post Image ' + (index + 1)" 
                  class="detail-image"
                  :class="{ active: currentImageIndex === index }"
                >
              </div>
              <button class="image-nav-btn next-btn" v-if="currentImageIndex < postDetail.images.length - 1" @click="nextSlide">
                <i class="fas fa-chevron-right"></i>
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
                <div v-if="postDetail.comments && postDetail.comments.length > 0">
                  <div v-for="(comment, index) in postDetail.comments" :key="index" class="comment-item">
                    <img :src="comment.avatar" alt="Commenter Avatar" class="comment-avatar">
                    <div class="comment-content">
                      <div class="comment-header">
                        <span class="comment-username">{{ comment.username }}</span>
                        <span class="comment-time">{{ comment.time }}</span>
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
            <button class="action-btn comment-input-box" @click="focusCommentInput">
              <i class="far fa-comment-dots"></i>
              <span>说点什么...</span>
            </button>
            <span class="likes-count" @click="toggleLike">
              <i :class="postDetail.isLiked ? 'fas fa-heart' : 'far fa-heart'"></i>
              <span class="likes-number">{{ postDetail.likes }}</span>
            </span>
            <span class="comments-count">
              <i class="far fa-star"></i>
              <span class="comments-number">{{ postDetail.comments ? postDetail.comments.length : 0 }}</span>
            </span>
            <span class="share-icon">
              <i class="far fa-comment-alt"></i> 评论
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: 'PostDetail',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    postDetail: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      currentImageIndex: 0
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        // 当弹窗显示时，禁止背景滚动
        document.body.style.overflow = 'hidden'
      } else {
        // 当弹窗关闭时，恢复背景滚动
        document.body.style.overflow = ''
      }
    }
  },
  methods: {
    closeDetail() {
      this.$emit('close')
    },
    prevSlide() {
      if (this.currentImageIndex > 0) {
        this.currentImageIndex--
      }
    },
    nextSlide() {
      if (this.currentImageIndex < this.postDetail.images.length - 1) {
        this.currentImageIndex++
      }
    },
    goToSlide(index) {
      this.currentImageIndex = index
    },
    toggleLike() {
      this.$emit('toggle-like')
    },
    focusCommentInput() {
      // 实现评论输入框聚焦
    }
  },
  beforeUnmount() {
    // 组件销毁前恢复背景滚动
    document.body.style.overflow = ''
  }
}
</script>

<style scoped>
@import '../styles/postDetail.css';

/* 添加过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.post-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.post-detail-card-standalone {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.close-card-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  z-index: 1;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-card-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}
</style> 