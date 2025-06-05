import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 配置 axios 默认值
const baseUrl = 'http://localhost:3000'

export function usePostDetail(props, emit, onDeleteSuccess) {
  // 响应式状态
  const currentImageIndex = ref(0)
  const commentContent = ref('')
  const comments = ref([])
  const isLoading = ref(false)
  const isDeleting = ref(false)
  const showDeleteConfirm = ref(false)
  const showDeleteCommentConfirm = ref(null)
  const commentToDelete = ref(null)
  const isAuthor = ref(false)
  const isAdmin = ref(false)
  const isLiked = ref(false)
  const likeCount = ref(0)
  const isCollected = ref(false)
  const collectCount = ref(0)
  const previewImageIndex = ref(0)
  const showImagePreview = ref(false)
  const mentionedUsers = ref([])
  const adminMentions = ref([])

  // 新增：返回艾特信息
  const mentionedUsersComputed = computed(() => {
    if (!props.postDetail) {
      console.log('postDetail 为空')
      return []
    }
    const users = props.postDetail.mentionedUsers || []
    return Array.isArray(users) ? users : []
  })

  const adminMentionsComputed = computed(() => {
    if (!props.postDetail) {
      console.log('postDetail 为空')
      return []
    }
    const mentions = props.postDetail.adminMentions || []
    return Array.isArray(mentions) ? mentions : []
  })

  // 检查权限
  const checkPermission = () => {
    const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}')
    isAuthor.value = currentUser.id === props.postDetail.creatorId
    isAdmin.value = currentUser.role === 'admin' || currentUser.role === 'superadmin'
  }

  // 检查是否已登录
  const isLoggedIn = () => {
    return !!localStorage.getItem('token')
  }

  // 加载评论
  const loadComments = async () => {
    if (!props.postDetail?.id) {
      console.error('文章ID不存在:', props.postDetail)
      return
    }
    try {
      console.log('开始加载评论，文章ID:', props.postDetail.id)
      const response = await axios.get(`${baseUrl}/api/articles/${props.postDetail.id}/comments`)
      console.log('评论加载响应:', response.data)
      comments.value = response.data
      console.log('评论列表已更新:', comments.value)
    } catch (error) {
      console.error('加载评论失败:', error)
      if (error.response) {
        console.error('错误响应:', error.response.data)
      }
    }
  }

  // 关闭详情
  const closeDetail = () => {
    console.log('关闭文章详情');
    emit('close');
  }

  // 处理头像加载错误
  const handleAvatarError = (e) => {
    e.target.src = 'http://localhost:3000/uploads/avatars/default-avatar.jpg'
  }

  // 图片导航
  const prevSlide = () => {
    if (currentImageIndex.value > 0) {
      currentImageIndex.value--
    }
  }

  const nextSlide = () => {
    if (currentImageIndex.value < props.postDetail.images.length - 1) {
      currentImageIndex.value++
    }
  }

  const goToSlide = (index) => {
    currentImageIndex.value = index
  }

  // 图片预览
  const openImagePreview = (index) => {
    previewImageIndex.value = index
    showImagePreview.value = true
  }

  const closeImagePreview = () => {
    showImagePreview.value = false
  }

  // 点赞相关
  const checkLikeStatus = async () => {
    if (!isLoggedIn()) {
      console.log('用户未登录，使用初始点赞数据')
      isLiked.value = false
      return
    }

    try {
      const response = await axios.get(`${baseUrl}/api/articles/${props.postDetail.id}/like-status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      isLiked.value = response.data.isLiked
      likeCount.value = response.data.likeCount
    } catch (error) {
      console.error('检查点赞状态失败:', error)
    }
  }

  const toggleLike = async () => {
    if (!isLoggedIn()) {
      alert('请先登录')
      return
    }

    try {
      const response = await axios.post(`${baseUrl}/api/articles/${props.postDetail.id}/like`, null, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      isLiked.value = !isLiked.value
      likeCount.value = response.data.likeCount

      emit('update-like-count', {
        articleId: props.postDetail.id,
        likeCount: response.data.likeCount,
        isLiked: isLiked.value
      })
    } catch (error) {
      console.error('点赞操作失败:', error)
      if (error.response?.data?.message?.includes('已经点赞过了') || 
          error.response?.data?.message?.includes('还没有点赞')) {
        await checkLikeStatus()
      } else {
        alert(error.response?.data?.message || '操作失败，请稍后重试')
      }
    }
  }

  // 收藏相关
  const checkCollectStatus = async () => {
    if (!isLoggedIn()) {
      console.log('用户未登录，使用初始收藏数据')
      isCollected.value = false
      return
    }

    try {
      const response = await axios.get(`${baseUrl}/api/articles/${props.postDetail.id}/collect-status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      isCollected.value = response.data.isCollected
      collectCount.value = response.data.collectCount
    } catch (error) {
      console.error('检查收藏状态失败:', error)
    }
  }

  const toggleCollect = async () => {
    if (!isLoggedIn()) {
      alert('请先登录')
      return
    }

    try {
      const response = await axios.post(`${baseUrl}/api/articles/${props.postDetail.id}/collect`, null, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      isCollected.value = !isCollected.value
      collectCount.value = response.data.collectCount

      emit('updateCollectCount', {
        articleId: props.postDetail.id,
        collectCount: response.data.collectCount,
        isCollected: isCollected.value
      })
    } catch (error) {
      console.error('收藏操作失败:', error)
      if (error.response?.data?.message?.includes('已经收藏过了') || 
          error.response?.data?.message?.includes('还没有收藏')) {
        await checkCollectStatus()
      } else {
        alert(error.response?.data?.message || '操作失败，请稍后重试')
      }
    }
  }

  // 评论相关
  const submitComment = async () => {
    if (!commentContent.value.trim() || isLoading.value) return
    if (!props.postDetail?.id) {
      console.error('文章ID不存在:', props.postDetail)
      alert('文章数据不完整，请刷新页面重试')
      return
    }
    
    isLoading.value = true
    try {
      const response = await axios.post(`${baseUrl}/api/articles/${props.postDetail.id}/comments`, {
        content: commentContent.value
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      comments.value.unshift(response.data)
      props.postDetail.commentCount = (props.postDetail.commentCount || 0) + 1
      commentContent.value = ''
      emit('comment-added', response.data)
    } catch (error) {
      console.error('提交评论失败:', error)
      if (error.response?.status === 401) {
        alert('请先登录后再评论')
      } else {
        alert('评论发送失败，请稍后重试')
      }
    } finally {
      isLoading.value = false
    }
  }

  // 删除相关
  const handleDelete = async () => {
    try {
      isDeleting.value = true;
      const token = localStorage.getItem('token');
      
      // 删除文章相关的消息
      await axios.delete(`${baseUrl}/api/messages/article/${props.postDetail.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // 删除文章
      await axios.delete(`${baseUrl}/api/articles/${props.postDetail.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      ElMessage.success('文章删除成功');
      closeDetail();
      // 触发文章删除事件
      emit('article-deleted', props.postDetail.id);
      // 调用删除成功的回调
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error('删除文章失败:', error);
      ElMessage.error('删除文章失败');
    } finally {
      isDeleting.value = false;
    }
  };

  // 判断是否是评论作者
  const isCommentAuthor = (comment) => {
    const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}')
    // 如果是管理员或超级管理员，也可以删除评论
    if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
      return true
    }
    return currentUser.id === comment.commenter._id
  }

  const showDeleteCommentConfirmDialog = (comment) => {
    commentToDelete.value = comment
    showDeleteCommentConfirm.value = true
  }

  const handleDeleteComment = async (comment) => {
    try {
      isDeleting.value = true;
      await axios.delete(`${baseUrl}/api/articles/${props.postDetail.id}/comments/${comment._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // 从评论列表中移除被删除的评论
      comments.value = comments.value.filter(c => c._id !== comment._id);
      ElMessage.success('评论删除成功');
    } catch (error) {
      console.error('删除评论失败:', error);
      ElMessage.error('删除评论失败');
    } finally {
      isDeleting.value = false;
    }
  };

  // 初始化数据
  const initLikeAndCollectData = () => {
    likeCount.value = props.postDetail.likeCount || 0
    collectCount.value = props.postDetail.collectCount || 0
    isLiked.value = props.postDetail.isLiked || false
    isCollected.value = props.postDetail.isCollected || false
  }

  // 监听器
  watch(() => props.show, (newVal) => {
    if (newVal) {
      document.body.style.overflow = 'hidden'
      comments.value = []
      currentImageIndex.value = 0
      loadComments()
    } else {
      document.body.style.overflow = ''
    }
  }, { immediate: true })

  watch(() => props.postDetail, (newVal) => {
    console.log('postDetail 发生变化，完整数据:', JSON.stringify(newVal, null, 2))
    if (newVal) {
      console.log('mentionedUsers 数据:', newVal.mentionedUsers)
      console.log('adminMentions 数据:', newVal.adminMentions)
      initLikeAndCollectData()
      
      if (isLoggedIn()) {
        checkLikeStatus()
        checkCollectStatus()
      }

      checkPermission()
      
      if (props.show) {
        loadComments()
      }
    }
  }, { immediate: true })

  watch(() => localStorage.getItem('token'), (newToken) => {
    if (newToken && props.postDetail) {
      checkLikeStatus()
      checkCollectStatus()
    }
  })

  // 生命周期钩子
  onMounted(() => {
    console.log('PostDetail mounted')
  })

  onBeforeUnmount(() => {
    document.body.style.overflow = ''
  })

  return {
    // 状态
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

    // 方法
    checkPermission,
    isLoggedIn,
    loadComments,
    closeDetail,
    handleAvatarError,
    prevSlide,
    nextSlide,
    goToSlide,
    openImagePreview,
    closeImagePreview,
    checkLikeStatus,
    toggleLike,
    checkCollectStatus,
    toggleCollect,
    submitComment,
    handleDelete,
    isCommentAuthor,
    showDeleteCommentConfirmDialog,
    handleDeleteComment
  }
} 