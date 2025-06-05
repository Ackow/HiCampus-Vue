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
              <div class="more-options-actions">
                <div class="more-options-trigger" @click="toggleMoreOptions">
                  <img src="/assets/images/更多设置.svg" alt="更多" class="btn-icon">
                </div>
                <div class="more-options-dropdown" v-show="showMoreOptions">
                  <div class="dropdown-item" @click="handlePostDelete" v-if="isPostAuthor || isAdmin">
                    <img src="/assets/images/删除文章.svg" alt="删除" class="btn-icon">
                    <span>删除文章</span>
                  </div>
                  <div class="dropdown-item" @click="showSharePanel = true; showMoreOptions = false">
                    <img src="/assets/images/分享.svg" alt="分享" class="btn-icon">
                    <span>分享</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="detail-content">
              <div class="detail-image-container">
                <button class="image-nav-btn prev-btn" v-if="currentImageIndex > 0" @click="prevSlide">
                  <img src="/assets/images/翻页1.svg" alt="left" class="image-nav-btn-icon">
                </button>
                <div class="image-slider">
                  <div v-if="postDetail.video && postDetail.video.url && currentImageIndex === 0" class="video-preview" @click="openVideoPreview">
                    <video 
                      :src="`http://localhost:3000${postDetail.video.url}`"
                      class="detail-video"
                      preload="metadata"
                      muted
                      playsinline
                    >
                      <source :src="`http://localhost:3000${postDetail.video.url}`" type="video/mp4">
                    </video>
                    <div class="video-overlay">
                      <img src="/assets/images/播放.svg" alt="播放" class="play-icon">
                      <span class="video-duration">{{ formatDuration(postDetail.video.duration) }}</span>
                    </div>
                  </div>
                  <img 
                    v-for="(image, index) in postDetail.images" 
                    :key="index"
                    :src="image" 
                    :alt="'Post Image ' + (index + 1)" 
                    class="detail-image"
                    :class="{ active: currentImageIndex === (postDetail.video ? index + 1 : index) }"
                    @click="openImagePreview(postDetail.video ? index + 1 : index)"
                  >
                </div>
                <button class="image-nav-btn next-btn" v-if="currentImageIndex < (postDetail.video ? postDetail.images.length : postDetail.images.length - 1)" @click="nextSlide">
                  <img src="/assets/images/翻页2.svg" alt="right" class="image-nav-btn-icon">
                </button>
                <div class="image-indicators">
                  <div 
                    v-for="(_, index) in (postDetail.video ? [null, ...postDetail.images] : postDetail.images)" 
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
                        <div class="comment-actions">
                          <button class="reply-btn" @click="handleReply(comment)">
                            <img src="/assets/images/评论.svg" alt="回复" class="reply-icon">
                            回复
                          </button>
                          <button 
                            v-if="checkCommentAuthor(comment) || isPostAuthor || isAdmin" 
                            class="delete-comment-btn"
                            @click="confirmDeleteComment(comment)"
                          >
                            <img src="/assets/images/删除文章.svg" alt="删除" class="btn-icon">
                          </button>
                        </div>
                        
                        <!-- 回复列表 -->
                        <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
                          <div v-for="reply in comment.replies" :key="reply._id" class="reply-item">
                            <img 
                              :src="getCommentDisplayInfo(reply).avatar" 
                              alt="Reply Avatar" 
                              class="reply-avatar"
                              @error="handleAvatarError"
                              @click="handleUserInfoClick($event, true, reply)"
                              :style="{ cursor: postDetail.topics?.includes('#吐槽区') ? 'default' : 'pointer' }"
                            >
                            <div class="reply-content">
                              <div class="reply-header">
                                <span class="reply-username">{{ getCommentDisplayInfo(reply).nickname }}</span>
                                <span v-if="reply.replyTo" class="reply-to">
                                  回复
                                  <span 
                                    class="reply-to-username"
                                    @click="handleUserInfoClick($event, true, null, reply.replyTo._id)"
                                    :style="{ cursor: postDetail.topics?.includes('#吐槽区') ? 'default' : 'pointer' }"
                                  >
                                    @{{ reply.replyTo.nickname }}
                                  </span>
                                </span>
                                <span class="reply-time">{{ new Date(reply.createdAt).toLocaleString() }}</span>
                                <button 
                                  v-if="checkCommentAuthor(reply) || isPostAuthor || isAdmin" 
                                  class="delete-comment-btn"
                                  @click="confirmDeleteComment(reply)"
                                >
                                  <img src="/assets/images/删除文章.svg" alt="删除" class="btn-icon">
                                </button>
                              </div>
                              <p class="reply-text">{{ reply.content }}</p>
                              <div class="reply-actions">
                                <button class="reply-btn" @click="handleReply(comment, reply)">
                                  <img src="/assets/images/评论.svg" alt="回复" class="reply-icon">
                                  回复
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
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
                  :placeholder="replyTo ? `回复 @${replyTo.nickname}` : '说点什么...'" 
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
                <button 
                  v-if="replyTo" 
                  class="cancel-reply-btn" 
                  @click="cancelReply"
                >
                  取消回复
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

    <Teleport to="body">
      <Transition name="fade">
        <div class="video-preview-overlay" v-if="showVideoPreview" @click.self="closeVideoPreview">
          <div class="video-preview-container">
            <button class="close-btn" @click="closeVideoPreview">×</button>
            <video 
              v-if="postDetail.video && postDetail.video.url"
              :src="`http://localhost:3000${postDetail.video.url}`"
              :poster="postDetail.video.thumbnail ? `http://localhost:3000${postDetail.video.thumbnail}` : '/assets/images/video-placeholder.jpg'"
              controls
              autoplay
              class="preview-video"
            >
              <source :src="`http://localhost:3000${postDetail.video.url}`" type="video/mp4">
              您的浏览器不支持视频播放。
            </video>
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

    <!-- 分享面板 -->
    <Teleport to="body">
      <Transition name="fade">
        <div class="share-panel-overlay" v-if="showSharePanel" @click.self="showSharePanel = false">
          <div class="share-panel">
            <div class="share-panel-header">
              <h3>分享到</h3>
            </div>
            <div class="share-options">
              <div class="share-option" @click="shareToWeChat">
                <img src="/assets/images/微信.svg" alt="微信" class="share-icon">
                <span>微信</span>
              </div>
              <div class="share-option" @click="shareToQQ">
                <img src="/assets/images/QQ.svg" alt="QQ" class="share-icon">
                <span>QQ</span>
              </div>
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
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../utils/useAuth'

const router = useRouter();
const { getUserInfo } = useAuth();
const baseUrl = 'http://localhost:3000';

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
  'updateCollectCount',
  'updateCommentCount'
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

// 从 usePostDetail 中解构需要的函数和变量
const {
  currentImageIndex,
  commentContent,
  comments,
  isLoading,
  isDeleting,
  showDeleteConfirm,
  showDeleteCommentConfirm,
  commentToDelete,
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
  handleDelete,
  showDeleteCommentConfirmDialog,
  handleDeleteComment,
  isLiked,
  likeCount,
  isCollected,
  collectCount
} = usePostDetail(props, emit)

// 添加回复相关的状态
const replyTo = ref(null);
const parentComment = ref(null);
const commentInput = ref(null);

// 处理回复
const handleReply = (comment, reply = null) => {
  parentComment.value = comment;
  replyTo.value = reply ? reply.commenter : comment.commenter;
  // 聚焦到输入框
  nextTick(() => {
    if (commentInput.value) {
      commentInput.value.focus();
    }
  });
};

// 取消回复
const cancelReply = () => {
  replyTo.value = null;
  parentComment.value = null;
  commentContent.value = '';
};

// 提交评论
const submitComment = async () => {
  if (!commentContent.value.trim()) return;
  
  try {
    isLoading.value = true;
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${baseUrl}/api/articles/${props.postDetail.id}/comments`,
      {
        content: commentContent.value,
        parentCommentId: parentComment.value?._id,
        replyToId: replyTo.value?._id
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (parentComment.value) {
      // 如果是回复，更新父评论的回复列表
      const parentCommentIndex = comments.value.findIndex(c => c._id === parentComment.value._id);
      if (parentCommentIndex !== -1) {
        if (!comments.value[parentCommentIndex].replies) {
          comments.value[parentCommentIndex].replies = [];
        }
        comments.value[parentCommentIndex].replies.push(response.data);
      }
    } else {
      // 如果是新评论，添加到评论列表
      comments.value.unshift(response.data);
    }

    // 清空输入框和回复状态
    commentContent.value = '';
    cancelReply();
    
    // 触发评论添加事件
    emit('comment-added');
  } catch (error) {
    console.error('提交评论失败:', error);
    ElMessage.error('评论发送失败，请重试');
  } finally {
    isLoading.value = false;
  }
};

// 在 script setup 部分添加权限判断逻辑
const isPostAuthor = ref(false);
const isAdmin = ref(false);
const isCommentAuthor = ref(false);

// 检查用户权限
const checkUserPermissions = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await fetch(`${baseUrl}/api/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('获取用户信息失败');
    }
    
    const data = await response.json();
    const currentUser = data.user;
    
    isPostAuthor.value = currentUser.id === props.postDetail.creatorId;
    isAdmin.value = currentUser.role === 'admin' || currentUser.role === 'superadmin';
  } catch (error) {
    console.error('获取用户权限失败:', error);
  }
};

// 检查是否是评论作者
const checkCommentAuthor = (comment) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const currentUserId = localStorage.getItem('uid');
    return currentUserId === comment.commenter._id;
  } catch (error) {
    console.error('检查评论作者失败:', error);
    return false;
  }
};

// 在组件挂载时检查权限
onMounted(() => {
  checkUserPermissions();
  document.addEventListener('click', handleClickOutside);
});

// 修改删除评论确认函数
const confirmDeleteComment = async (comment) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      ElMessage.warning('请先登录');
      return;
    }

    // 获取当前用户信息
    const response = await fetch(`${baseUrl}/api/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('获取用户信息失败');
    }
    
    const data = await response.json();
    const currentUser = data.user;

    // 判断权限：评论作者、文章作者或管理员可以删除
    const isCommentAuthor = currentUser.id === comment.commenter._id;
    const canDelete = isCommentAuthor || isPostAuthor.value || isAdmin.value;

    if (!canDelete) {
      ElMessage.warning('您没有权限删除此评论');
      return;
    }

    const confirmed = await ElMessageBox.confirm(
      '确定要删除这条评论吗？此操作不可恢复',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    if (confirmed) {
      await axios.delete(`${baseUrl}/api/articles/${props.postDetail.id}/comments/${comment._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // 更新评论列表
      if (comment.parentComment) {
        // 如果是回复，从父评论的replies中移除
        const parentComment = comments.value.find(c => c._id === comment.parentComment);
        if (parentComment) {
          parentComment.replies = parentComment.replies.filter(r => r._id !== comment._id);
        }
      } else {
        // 如果是主评论，从评论列表中移除
        comments.value = comments.value.filter(c => c._id !== comment._id);
      }

      // 更新评论数
      props.postDetail.commentCount--;
      emit('updateCommentCount', props.postDetail.commentCount);

      ElMessage.success('评论已删除');
    }
  } catch (error) {
    console.error('删除评论失败:', error);
    ElMessage.error('删除评论失败，请重试');
  }
};

// 修改删除文章确认函数
const confirmDelete = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      ElMessage.warning('请先登录');
      return;
    }

    // 判断权限：作者或管理员可以删除
    if (!isPostAuthor.value && !isAdmin.value) {
      ElMessage.warning('您没有权限删除此文章');
      return;
    }

    ElMessageBox.confirm(
      '删除后将无法恢复，是否确认删除该文章？',
      '确认删除',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
      .then(() => {
        handleDelete();
      })
      .catch(() => {
        // 用户取消删除
      });
  } catch (error) {
    console.error('删除文章失败:', error);
    ElMessage.error('删除文章失败，请重试');
  }
};

// 添加视频预览相关的状态
const showVideoPreview = ref(false)

const openVideoPreview = () => {
  showVideoPreview.value = true
}

const closeVideoPreview = () => {
  showVideoPreview.value = false
}

// 格式化视频时长
const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const showSharePanel = ref(false);

// 生成分享链接
const generateShareUrl = () => {
  const url = `${window.location.origin}/post/${props.postDetail.id}`;
  const title = props.postDetail.title;
  const desc = props.postDetail.description;
  return {
    url,
    title,
    desc
  };
};

// 分享到微信
const shareToWeChat = () => {
  const { url, title, desc } = generateShareUrl();
  // 使用微信分享接口
  if (window.wx) {
    window.wx.ready(() => {
      window.wx.updateAppMessageShareData({
        title: title,
        desc: desc,
        link: url,
        imgUrl: props.postDetail.images?.[0] || '',
        success: () => {
          ElMessage.success('分享成功');
        }
      });
    });
  } else {
    // 如果没有微信SDK，使用二维码方式
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    window.open(qrCodeUrl, '_blank');
  }
  showSharePanel.value = false;
};

// 分享到QQ
const shareToQQ = () => {
  const { url, title, desc } = generateShareUrl();
  const shareUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(desc)}`;
  window.open(shareUrl, '_blank');
  showSharePanel.value = false;
};

const showMorePanel = ref(false);

// 处理分享
const handleShare = () => {
  showMorePanel.value = false;
  showSharePanel.value = true;
};

// 处理删除
const handlePostDelete = async () => {
  try {
    showMorePanel.value = false;
    const confirmed = await ElMessageBox.confirm(
      '确定要删除这篇文章吗？此操作不可恢复',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    if (confirmed) {
      const token = localStorage.getItem('token');
      await axios.delete(`${baseUrl}/api/articles/${props.postDetail.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      ElMessage.success('文章已删除');
      emit('close');
    }
  } catch (error) {
    console.error('删除文章失败:', error);
    ElMessage.error('删除文章失败，请重试');
  }
};

const showMoreOptions = ref(false);

// 切换下拉框显示状态
const toggleMoreOptions = () => {
  showMoreOptions.value = !showMoreOptions.value;
};

// 点击外部关闭下拉框
const handleClickOutside = (event) => {
  const moreOptions = document.querySelector('.more-options-actions');
  if (moreOptions && !moreOptions.contains(event.target)) {
    showMoreOptions.value = false;
  }
};

// 在组件挂载时添加点击事件监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

// 在组件卸载时移除点击事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
@import '../styles/postDetail.css';

</style> 