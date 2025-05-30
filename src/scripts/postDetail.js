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

  // 方法定义
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

  const closeDetail = () => {
    emit('close')
  }

  const handleAvatarError = (e) => {
    e.target.src = 'http://localhost:3000/uploads/avatars/default-avatar.jpg'
  }

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

  const toggleLike = () => {
    emit('toggle-like')
  }

  const submitComment = async () => {
    if (!commentContent.value.trim() || isLoading.value) return
    if (!props.postDetail?.id) {
      console.error('文章ID不存在:', props.postDetail)
      alert('文章数据不完整，请刷新页面重试')
      return
    }
    
    isLoading.value = true
    try {
      console.log('发送评论，文章ID:', props.postDetail.id)
      const response = await axios.post(`/api/articles/${props.postDetail.id}/comments`, {
        content: commentContent.value
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      // 添加新评论到列表
      comments.value.unshift(response.data)
      // 更新评论数
      props.postDetail.commentCount = (props.postDetail.commentCount || 0) + 1
      // 清空输入框
      commentContent.value = ''
      // 通知父组件评论已添加
      emit('comment-added', response.data)
    } catch (error) {
      console.error('发送评论失败:', error)
      if (error.response?.status === 401) {
        // 未登录或 token 过期
        alert('请先登录后再评论')
      } else {
        alert('评论发送失败，请稍后重试')
      }
    } finally {
      isLoading.value = false
    }
  }

  // 监听 show 属性变化
  watch(() => props.show, (newVal) => {
    if (newVal) {
      document.body.style.overflow = 'hidden'
      // 重置评论列表和图片索引
      comments.value = []
      currentImageIndex.value = 0
      // 重新加载评论
      loadComments()
    } else {
      document.body.style.overflow = ''
    }
  }, { immediate: true })

  // 监听 postDetail 变化
  watch(() => props.postDetail, (newVal) => {
    // console.log('postDetail changed:', newVal)
    // 当 postDetail 变化时，如果当前是显示状态，重新加载评论
    if (props.show) {
      loadComments()
    }
  }, { immediate: true })

  // 组件挂载和卸载
  onMounted(() => {
    console.log('PostDetail mounted, postDetail')
  })

  onBeforeUnmount(() => {
    document.body.style.overflow = ''
  })

  return {
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
  }
} 