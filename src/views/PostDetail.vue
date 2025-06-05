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
                  <div class="dropdown-item" @click="handlePostDelete" v-if="isAuthor || isAdmin">
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
                            v-if="isCommentAuthor(comment) || isAdmin" 
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
                              @click="handleUserInfoClick($event, true, null, reply.replyTo._id)"
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
                                  v-if="isCommentAuthor(reply) || isAdmin" 
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
const isAuthor = computed(async () => {
  try {
    const response = await fetch(`${baseUrl}/api/user`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      return data.user.id === props.postDetail.creatorId;
    }
    return false;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return false;
  }
});

const isAdmin = computed(async () => {
  try {
    const response = await fetch(`${baseUrl}/api/user`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      console.log('云端用户信息:', data.user);
      return data.user.role === 'admin';
    }
    return false;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return false;
  }
});

// 修改评论作者判断逻辑
const isCommentAuthor = async (comment) => {
  try {
    const response = await fetch(`${baseUrl}/api/user`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      return data.user.id === comment.commenter._id;
    }
    return false;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return false;
  }
};

// 修改用户信息点击处理函数
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

  try {
    // 获取当前登录用户信息
    const response = await fetch(`${baseUrl}/api/user`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('获取用户信息失败');
    }
    
    const data = await response.json();
    const currentUser = data.user;
    console.log('当前用户ID:', currentUser.id);
    
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

// 修改删除文章确认函数
const confirmDelete = async () => {
  try {
    const response = await fetch(`${baseUrl}/api/user`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('获取用户信息失败');
    }
    
    const data = await response.json();
    const currentUser = data.user;
    
    if (currentUser.id !== props.postDetail.creatorId && currentUser.role !== 'admin') {
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
    console.error('获取用户信息失败:', error);
    ElMessage.error('获取用户信息失败');
  }
};

// 修改删除评论确认函数
const confirmDeleteComment = async (comment) => {
  try {
    const uid = localStorage.getItem('uid');
    if (!uid) {
      ElMessage.error('请先登录');
      return;
    }

    // 获取当前用户信息
    const response = await fetch(`${baseUrl}/api/user`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('获取用户信息失败');
    }
    
    const data = await response.json();
    const currentUser = data.user;

    console.log('当前用户信息:', currentUser);
    if (uid !== comment.commenter._id && currentUser.role !== 'admin' && currentUser.role !== 'superadmin' ) {
      ElMessage.error('您没有权限删除此评论');
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
      const token = localStorage.getItem('token');
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

.video-preview {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  background-color: #000;
}

.detail-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background-color: #000;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.3);
  pointer-events: none;
}

.play-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
}

.video-duration {
  color: white;
  font-size: 14px;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 2px 6px;
  border-radius: 4px;
}

.video-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1005;
}

.video-preview-container {
  position: relative;
  width: 80%;
  max-width: 1200px;
  max-height: 80vh;
}

.preview-video {
  width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 32px;
  cursor: pointer;
  padding: 8px;
}

.close-btn:hover {
  opacity: 0.8;
}

.replies-list {
  margin-top: 12px;
}

.reply-item {
  display: flex;
  margin-bottom: 12px;
}

.reply-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 12px;
  cursor: pointer;
}

.reply-content {
  flex: 1;
}

.reply-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  gap: 8px;
  position: relative;
}

.reply-header .delete-comment-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  opacity: 0.6;
  transition: opacity 0.3s;
  margin-left: auto;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.reply-header .delete-comment-btn:hover {
  opacity: 1;
}

.reply-header .btn-icon {
  width: 16px;
  height: 16px;
}

.reply-username {
  font-weight: 500;
  color: #333;
  margin-right: 8px;
}

.reply-to {
  color: #666;
  font-size: 14px;
  margin-right: 8px;
}

.reply-to-username {
  color: #1890ff;
  cursor: pointer;
}

.reply-to-username:hover {
  text-decoration: underline;
}

.reply-time {
  color: #999;
  font-size: 12px;
}

.reply-text {
  color: #333;
  margin: 4px 0;
  line-height: 1.5;
}

.reply-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reply-btn {
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.reply-icon {
  width: 16px;
  height: 16px;
  opacity: 0.8;
}

.reply-btn:hover {
  color: #d6d6d6;
}

.reply-btn:hover .reply-icon {
  opacity: 1;
}

.cancel-reply-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0 8px;
  font-size: 14px;
}

.cancel-reply-btn:hover {
  color: #333;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.delete-comment-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  opacity: 0.6;
  transition: opacity 0.3s;
  margin-left: auto;
}

.delete-comment-btn:hover {
  opacity: 1;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.share-actions {
  position: relative;
}

.share-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.3s;
}

.share-option:hover {
  background-color: #f5f5f5;
}

.share-icon {
  width: 20px;
  height: 20px;
}

.post-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-top: 1px solid #eee;
  margin-top: 16px;
}

.action-group {
  display: flex;
  gap: 24px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #666;
  font-size: 14px;
}

.action-icon {
  width: 20px;
  height: 20px;
}

.more-actions {
  position: relative;
}

.more-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.more-panel {
  position: absolute;
  bottom: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 8px;
  margin-bottom: 8px;
  z-index: 1000;
  min-width: 120px;
}

.more-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.3s;
  color: #333;
}

.more-option:hover {
  background-color: #f5f5f5;
}

.more-option.delete-option {
  color: #f56c6c;
}

.more-icon {
  width: 16px;
  height: 16px;
}

.more-options-actions {
  position: relative;
}

.more-options-trigger {
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.more-options-trigger:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.more-options-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  min-width: 120px;
  z-index: 1000;
  margin-top: 8px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  color: #333;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-item:first-child {
  color: #f56c6c;
}

.dropdown-item .btn-icon {
  width: 16px;
  height: 16px;
}

.share-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.share-panel {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 320px;
  padding: 20px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2001;
}

.share-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  text-align: center;
}

.share-panel-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
  width: 100%;
  text-align: center;
}

.share-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 10px 0;
  justify-items: center;
}

.share-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.share-option:hover {
  background-color: #f5f5f5;
}

.share-icon {
  width: 40px;
  height: 40px;
}

.share-option span {
  font-size: 14px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  position: relative;
  z-index: 2002;
}

.close-btn:hover {
  color: #666;
}
</style> 