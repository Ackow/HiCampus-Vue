import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export function usePublish() {
  const router = useRouter()
  const images = ref([])
  const mentions = ref([]) // 存储被艾特的用户
  const topics = ref([]) // 存储话题
  const searchResults = ref([])
  const showTopicSearch = ref(false)
  const showUserSearch = ref(false)
  const topicQuery = ref('')
  const userQuery = ref('')
  const title = ref('')
  const content = ref('')
  const isPublishing = ref(false)
  const topicSearchRef = ref(null)
  const userSearchRef = ref(null)

  // 默认话题选项
  const defaultTopics = [
    '#校园生活',
    '#学习交流',
    '#社团活动',
    '#校园美食',
    '#校园风景',
    '#校园趣事',
    '#游戏'
  ]

  // 计算属性：过滤掉已选择的话题
  const availableTopics = computed(() => {
    return defaultTopics.filter(topic => !topics.value.includes(topic))
  })

  // 添加被艾特的用户
  const addMention = (user) => {
    if (!mentions.value.find(m => m.id === user.id)) {
      mentions.value.push(user)
    }
  }

  // 移除被艾特的用户
  const removeMention = (userId) => {
    mentions.value = mentions.value.filter(m => m.id !== userId)
  }

  // 添加话题
  const addTopic = (topic) => {
    if (!topics.value.find(t => t === topic)) {
      topics.value.push(topic)
    }
  }

  // 移除话题
  const removeTopic = (topic) => {
    topics.value = topics.value.filter(t => t !== topic)
  }

  // 搜索用户
  const searchUsers = async (query) => {
    if (!query) {
      searchResults.value = []
      return
    }
    try {
      console.log('搜索用户，查询词:', query)
      const response = await fetch(`http://localhost:3000/api/users/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('搜索用户结果:', data)
        if (data.users && Array.isArray(data.users)) {
          searchResults.value = data.users.map(user => ({
            id: user._id || user.id,
            name: user.nickname || user.username,
            nickname: user.nickname || user.username,
            username: user.username,
            studentId: user.studentId || '',
            avatar: user.avatar || '/assets/images/default-avatar.png'
          }))
        } else {
          console.error('搜索用户结果格式错误:', data)
          searchResults.value = []
        }
      } else {
        console.error('搜索用户失败:', response.status)
        searchResults.value = []
      }
    } catch (error) {
      console.error('搜索用户失败:', error)
      searchResults.value = []
    }
  }

  // 处理用户选择
  const handleUserSelect = (user) => {
    console.log('选择用户:', user)
    if (!user || !user.id) {
      console.error('无效的用户数据:', user)
      return
    }
    addMention({
      id: user.id,
      name: user.name || user.nickname || user.username,
      studentId: user.studentId || '',
      avatar: user.avatar
    })
    showUserSearch.value = false
    userQuery.value = ''
    searchResults.value = []
  }

  // 处理话题选择
  const handleTopicSelect = (topic) => {
    addTopic(topic)
    showTopicSearch.value = false
    topicQuery.value = ''
  }

  // 添加自定义话题
  const addCustomTopic = () => {
    let topic = topicQuery.value.trim()
    if (topic && !topic.startsWith('#')) {
      topic = '#' + topic
    }
    if (topic && !topics.value.includes(topic)) {
      addTopic(topic)
    }
    topicQuery.value = ''
    showTopicSearch.value = false
  }

  // 触发文件选择
  const triggerImageInput = (imageInputRef) => {
    if (imageInputRef && imageInputRef.value) {
      imageInputRef.value.click()
    }
  }

  // 处理图片选择
  const handleImageSelect = (event) => {
    const files = event.target.files
    if (!files) return

    // 检查是否超过9张图片
    if (images.value.length + files.length > 9) {
      alert('最多只能上传9张图片')
      return
    }

    // 处理每个选择的文件
    Array.from(files).forEach(file => {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        return
      }

      // 验证文件大小（5MB限制）
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB')
        return
      }

      // 创建预览
      const reader = new FileReader()
      reader.onload = (e) => {
        images.value.push({
          file: file,
          preview: e.target.result
        })
      }
      reader.readAsDataURL(file)
    })

    // 清空input，允许重复选择同一文件
    event.target.value = ''
  }

  // 删除图片
  const removeImage = (index) => {
    images.value.splice(index, 1)
  }

  // 上传图片到服务器
  const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('http://localhost:3000/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('图片上传失败')
      }

      const data = await response.json()
      return data.imageUrl
    } catch (error) {
      console.error('图片上传错误:', error)
      throw error
    }
  }

  // 创建文章
  const createArticle = async (articleData) => {
    try {
      // 添加艾特用户和话题信息
      const articleWithMentionsAndTopics = {
        ...articleData,
        mentions: mentions.value.map(m => m.id), // 只发送用户ID
        topics: topics.value
      }

      const response = await fetch('http://localhost:3000/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(articleWithMentionsAndTopics)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '文章发布失败')
      }

      return await response.json()
    } catch (error) {
      console.error('文章发布错误:', error)
      throw error
    }
  }

  // 点击外部关闭弹窗
  const handleClickOutside = (event) => {
    // 检查点击是否在弹窗内
    const isClickInTopicPopup = topicSearchRef.value && topicSearchRef.value.contains(event.target)
    const isClickInUserPopup = userSearchRef.value && userSearchRef.value.contains(event.target)
    
    // 检查点击是否在按钮上
    const isClickOnTopicButton = event.target.closest('.option-tag') && event.target.closest('.option-tag').querySelector('img[alt="话题"]')
    const isClickOnUserButton = event.target.closest('.option-tag') && event.target.closest('.option-tag').querySelector('img[alt="用户"]')

    // 如果点击在弹窗外且不在对应的按钮上，则关闭弹窗
    if (showTopicSearch.value && !isClickInTopicPopup && !isClickOnTopicButton) {
      showTopicSearch.value = false
    }
    if (showUserSearch.value && !isClickInUserPopup && !isClickOnUserButton) {
      showUserSearch.value = false
    }
  }

  // 发布文章
  const handlePublish = async () => {
    // 表单验证
    if (!title.value.trim()) {
      alert('请输入文章标题')
      return
    }

    if (!content.value.trim()) {
      alert('请输入文章内容')
      return
    }

    // 从localStorage获取用户信息和token
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const token = localStorage.getItem('token')
    
    if (!userInfo || !userInfo.id || !token) {
      alert('请先登录')
      return
    }

    try {
      isPublishing.value = true

      // 1. 先上传所有图片
      const uploadedImages = []
      for (const image of images.value) {
        try {
          const imageUrl = await uploadImage(image.file)
          uploadedImages.push({ imageUrl })
        } catch (error) {
          console.error('图片上传失败:', error)
          throw new Error('图片上传失败，请重试')
        }
      }

      // 2. 创建文章数据
      const articleData = {
        title: title.value,
        content: content.value,
        images: uploadedImages
      }

      // 3. 发布文章
      await createArticle(articleData)

      // 4. 发布成功
      alert('发布成功！')
      // 清空表单
      title.value = ''
      content.value = ''
      images.value = []
      mentions.value = []
      topics.value = []
      // 跳转到首页
      router.push('/')

    } catch (error) {
      console.error('发布错误:', error)
      alert('发布失败：' + error.message)
    } finally {
      isPublishing.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  return {
    title,
    content,
    images,
    mentions,
    topics,
    searchResults,
    showTopicSearch,
    showUserSearch,
    topicQuery,
    userQuery,
    availableTopics,
    isPublishing,
    topicSearchRef,
    userSearchRef,
    triggerImageInput,
    handleImageSelect,
    removeImage,
    addMention,
    removeMention,
    addTopic,
    removeTopic,
    searchUsers,
    handleUserSelect,
    handleTopicSelect,
    addCustomTopic,
    handleClickOutside,
    handlePublish
  }
} 