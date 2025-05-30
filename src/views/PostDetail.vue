<template>
  <Teleport to="body">
    <Transition name="fade">
      <div class="post-detail-overlay" v-if="show" @click.self="closeDetail">
        <div class="post-detail-card-standalone">
          
          <div class="detail-header">
            <div class="user-info">
              <img :src="getUserDisplayInfo(postDetail).avatar" alt="User Avatar" class="detail-avatar">
              <span class="detail-username">{{ getUserDisplayInfo(postDetail).nickname }}</span>
            </div>
            <button class="more-options-btn" @click="showDeleteConfirm = true" v-if="isAuthor || isAdmin">
              <img src="/assets/images/删除文章.svg" alt="删除" class="btn-icon">
            </button>
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
                      :src="getCommentDisplayInfo(comment).avatar" 
                      alt="Commenter Avatar" 
                      class="comment-avatar"
                      @error="handleAvatarError"
                    >
                    <div class="comment-content">
                      <div class="comment-header">
                        <span class="comment-username">{{ getCommentDisplayInfo(comment).nickname }}</span>
                        <span class="comment-time">{{ new Date(comment.createdAt).toLocaleString() }}</span>
                      </div>
                      <p class="comment-text">{{ comment.content }}</p>
                    </div>
                    <button 
                      v-if="isCommentAuthor(comment) || isAdmin" 
                      class="delete-comment-btn"
                      @click="showDeleteCommentConfirmDialog(comment)"
                    >
                      <img src="/assets/images/删除文章.svg" alt="删除" class="btn-icon">
                    </button>
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
            <div class="action-buttons">
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

  <!-- 删除确认弹窗 -->
  <Teleport to="body">
    <Transition name="fade">
      <div class="delete-confirm-overlay" v-if="showDeleteConfirm" @click.self="showDeleteConfirm = false">
        <div class="delete-confirm-modal">
          <h3>确认删除</h3>
          <p>删除后将无法恢复，是否确认删除该文章？</p>
          <div class="delete-confirm-buttons">
            <button class="cancel-btn" @click="showDeleteConfirm = false">取消</button>
            <button class="delete-btn" @click="handleDelete" :disabled="isDeleting">
              {{ isDeleting ? '删除中...' : '确认删除' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- 删除评论确认弹窗 -->
  <Teleport to="body">
    <Transition name="fade">
      <div class="delete-confirm-overlay" v-if="showDeleteCommentConfirm" @click.self="showDeleteCommentConfirm = null">
        <div class="delete-confirm-modal">
          <h3>确认删除</h3>
          <p>删除后将无法恢复，是否确认删除该评论？</p>
          <div class="delete-confirm-buttons">
            <button class="cancel-btn" @click="showDeleteCommentConfirm = null">取消</button>
            <button class="delete-btn" @click="handleDeleteComment" :disabled="isDeleting">
              {{ isDeleting ? '删除中...' : '确认删除' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
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

// 添加随机昵称生成函数
const generateRandomNickname = () => {
  const adjectives = ['快乐的', '机智的', '可爱的', '神秘的', '活泼的', '安静的', '聪明的', '善良的'];
  const nouns = ['小兔子', '小猫咪', '小狗狗', '小熊猫', '小松鼠', '小仓鼠', '小浣熊', '小狐狸'];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return randomAdjective + randomNoun;
};

// 获取用户显示信息
const getUserDisplayInfo = (postDetail) => {
  // 检查文章是否属于吐槽区
  const isComplaintArea = postDetail.topics && postDetail.topics.includes('#吐槽区');
  
  if (isComplaintArea) {
    return {
      nickname: generateRandomNickname(),
      avatar: 'http://localhost:3000/uploads/avatars/default-avatar.jpg'
    };
  }
  return {
    nickname: postDetail.username,
    avatar: postDetail.avatar
  };
};

// 获取评论显示信息
const getCommentDisplayInfo = (comment) => {
  if (props.postDetail.topics && props.postDetail.topics.includes('#吐槽区')) {
    return {
      nickname: generateRandomNickname(),
      avatar: 'http://localhost:3000/uploads/avatars/default-avatar.jpg'
    };
  }
  return {
    nickname: comment.commenter.nickname,
    avatar: `http://localhost:3000/uploads/avatars/${comment.commenter.avatar}`
  };
};

const {
  currentImageIndex,
  commentContent,
  comments,
  isLoading,
  isDeleting,
  showDeleteConfirm,
  showDeleteCommentConfirm,
  commentToDelete,
  isAuthor,
  isAdmin,
  isLiked,
  likeCount,
  isCollected,
  collectCount,
  previewImageIndex,
  showImagePreview,
  closeDetail,
  handleAvatarError,
  prevSlide,
  nextSlide,
  goToSlide,
  openImagePreview,
  closeImagePreview,
  toggleLike,
  toggleCollect,
  submitComment,
  handleDelete,
  isCommentAuthor,
  showDeleteCommentConfirmDialog,
  handleDeleteComment
} = usePostDetail(props, emit)
</script>

<style scoped>
@import '../styles/postDetail.css';
</style> 