<template>
  <div>
    <Teleport to="body">
      <Transition name="fade">
        <div class="post-detail-overlay" v-if="show" @click.self="closeDetail">
          <div class="post-detail-card-standalone">
            <div class="detail-header">
              <div class="user-info" @click="handleUserInfoClick" style="cursor: pointer;">
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
                  <p class="post-mentions" v-if="mentionedUsers.length > 0 || adminMentions.length > 0">
                    <template v-if="mentionedUsers.length > 0">
                      <span 
                        v-for="(user, index) in mentionedUsers" 
                        :key="'user-'+index"
                        class="mentioned-user"
                        @click="handleUserInfoClick($event, false, null, user._id)"
                      >
                        @{{ user.nickname }}
                      </span>
                    </template>
                    <template v-if="adminMentions.length > 0">
                      <span v-if="mentionedUsers.length > 0">，</span>
                      <span 
                        v-for="(mention, index) in adminMentions" 
                        :key="'admin-'+index"
                        class="admin-mention"
                      >
                        @{{ mention === 'all_users' ? '全体用户' : mention.replace('college:', '') }}
                      </span>
                    </template>
                  </p>
                  <div class="post-tags" v-if="postDetail.topics && postDetail.topics.length > 0">
                    <span 
                      v-for="(topic, index) in postDetail.topics" 
                      :key="index" 
                      class="tag"
                      :class="{ 'complaint-tag': topic === '#吐槽区' }"
                    >
                      {{ topic }}
                    </span>
                  </div>
                  <div v-if="postDetail.location" class="post-location">
                    <img src="/assets/images/定位.svg" alt="地点" class="location-icon">
                    <div class="location-info">
                      <div class="location-name">{{ postDetail.location.name }}</div>
                    </div>
                  </div>
                </div>

                <div class="comments-section">
                  <div v-if="comments.length > 0">
                    <div v-for="comment in comments" :key="comment._id" class="comment-item">
                      <img 
                        :src="getCommentDisplayInfo(comment).avatar" 
                        alt="Commenter Avatar" 
                        class="comment-avatar"
                        @error="handleAvatarError"
                        @click="handleUserInfoClick($event, true, comment)"
                        :style="{ cursor: postDetail.topics?.includes('#吐槽区') ? 'default' : 'pointer' }"
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
                  <img :src="isLiked ? './assets/images/爱心-红.svg' : './assets/images/爱心.svg'" 
                       :alt="isLiked ? '已点赞' : '未点赞'" 
                       class="btn-icon">
                  <span>{{ likeCount }}</span>
                </div>
                <div class="collect-count" :class="{ 'collected': isCollected }" @click="toggleCollect">
                  <img :src="isCollected ? './assets/images/收藏-黄.svg' : './assets/images/收藏.svg'" 
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

    <ImagePreview
      :show="showImagePreview"
      :images="postDetail.images"
      :initial-index="previewImageIndex"
      @close="closeImagePreview"
    />

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
  </div>
</template>

<script setup>
import { usePostDetail } from '../scripts/postDetail'
import ImagePreview from '../components/ImagePreview.vue'
import { useRouter } from 'vue-router'

const router = useRouter();
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
  // console.log('获取用户显示信息:', postDetail);
  // 检查文章是否属于吐槽区
  const isComplaintArea = postDetail.topics && postDetail.topics.includes('#吐槽区');
  
  if (isComplaintArea) {
    return {
      nickname: generateRandomNickname(),
      avatar: 'http://localhost:3000/uploads/avatars/default-avatar.jpg'
    };
  }
  
  // 确保返回正确的用户信息
  return {
    nickname: postDetail.username || postDetail.creator?.nickname,
    avatar: postDetail.avatar || `http://localhost:3000/uploads/avatars/${postDetail.creator?.avatar}`
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
  mentionedUsers,
  adminMentions,
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

// 添加用户信息点击处理函数
const handleUserInfoClick = async (event, isComment = false, comment = null, userId = null) => {
  // 检查是否是吐槽区
  const isComplaintArea = props.postDetail.topics && props.postDetail.topics.includes('#吐槽区');
  if (isComplaintArea) {
    console.log('吐槽区文章，不进行跳转');
    return;
  }

  const authorId = isComment ? comment.commenter._id : props.postDetail.creatorId;
  console.log('作者ID:', authorId);
  
  if (!authorId) {
    console.error('无法获取作者ID');
    return;
  }

  // 获取当前登录用户信息
  const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
  console.log('当前用户ID:', currentUser.id);
  
  try {
    // 先关闭文章详情
    closeDetail();
    
    // 等待一小段时间确保关闭动画完成
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 判断是否是当前用户
    if (currentUser.id === authorId) {
      // 如果是当前用户，跳转到个人主页
      await router.push({ 
        name: 'Profile'
      });
    } else {
      // 如果是其他用户，跳转到用户主页
      await router.push({ 
        name: 'UserProfile',
        params: { userId: authorId }
      });
    }
    
    console.log('路由跳转成功');
  } catch (error) {
    console.error('路由跳转失败:', error);
  }
};
</script>

<style scoped>
@import '../styles/postDetail.css';

.post-mentions {
  color: #666;
  font-size: 14px;
  margin: 8px 0;
  line-height: 1.5;
}

.mentioned-user {
  color: #1890ff;
  cursor: pointer;
  margin: 0 4px;
}

.mentioned-user:hover {
  text-decoration: underline;
}

.admin-mention {
  color: #ff4d4f;
  margin: 0 4px;
}
</style> 