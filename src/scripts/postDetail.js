import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'

// 配置 axios 默认值
axios.defaults.baseURL = 'http://localhost:3000'

export function usePostDetail(props, emit) {
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

  // 检查权限
  const checkPermission = () => {
    const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}')
    isAuthor.value = currentUser.id === props.postDetail.creatorId
    isAdmin.value = currentUser.role === 'admin'
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
      const response = await axios.get(`/api/articles/${props.postDetail.id}/comments`)
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
      const response = await axios.get(`/api/articles/${props.postDetail.id}/like-status`, {
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
      const method = isLiked.value ? 'delete' : 'post'
      const response = await axios[method](`/api/articles/${props.postDetail.id}/like`, {}, {
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
      const response = await axios.get(`/api/articles/${props.postDetail.id}/collect-status`, {
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
      const method = isCollected.value ? 'delete' : 'post'
      const response = await axios[method](`/api/articles/${props.postDetail.id}/collect`, {}, {
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
      const response = await axios.post(`/api/articles/${props.postDetail.id}/comments`, {
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
      console.error('发送评论失败:', error)
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
    if (isDeleting.value) return
    
    try {
      isDeleting.value = true
      await axios.delete(`/api/articles/${props.postDetail.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      showDeleteConfirm.value = false
      closeDetail()
      window.location.reload()
    } catch (error) {
      console.error('删除文章失败:', error)
      alert('删除失败，请重试')
    } finally {
      isDeleting.value = false
    }
  }

  const isCommentAuthor = (comment) => {
    const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}')
    return currentUser.id === comment.commenter._id
  }

  const showDeleteCommentConfirmDialog = (comment) => {
    commentToDelete.value = comment
    showDeleteCommentConfirm.value = true
  }

  const handleDeleteComment = async () => {
    if (isDeleting.value || !commentToDelete.value) return
    
    try {
      isDeleting.value = true
      await axios.delete(`/api/articles/${props.postDetail.id}/comments/${commentToDelete.value._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      const index = comments.value.findIndex(c => c._id === commentToDelete.value._id)
      if (index !== -1) {
        comments.value.splice(index, 1)
      }

      showDeleteCommentConfirm.value = null
      commentToDelete.value = null
    } catch (error) {
      console.error('删除评论失败:', error)
      alert('删除失败，请重试')
    } finally {
      isDeleting.value = false
    }
  }

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
    if (newVal) {
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