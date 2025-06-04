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
  const showLocationSearch = ref(false)
  const topicQuery = ref('')
  const userQuery = ref('')
  const locationQuery = ref('')
  const title = ref('')
  const content = ref('')
  const isPublishing = ref(false)
  const topicSearchRef = ref(null)
  const userSearchRef = ref(null)
  const locationSearchRef = ref(null)
  const selectedLocation = ref(null)
  const locationResults = ref([])

  // 默认话题选项
  const defaultTopics = [
    '#校园生活',
    '#学习交流',
    '#社团活动',
    // '#美食',
    // '#校园风景',
    '#吐槽区',
    '#游戏交流',
    '#二手闲置',
    '#竞赛分享'
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
      const response = await fetch(`http://localhost:3000/api/user/users/search?q=${encodeURIComponent(query)}`, {
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
      const response = await fetch('http://localhost:3000/api/user/upload/image', {
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
        mentions: mentions.value.map(m => m.id), // 确保只发送用户ID
        topics: topics.value,
        adminMentions: articleData.adminMentions || [] // 确保adminMentions有默认值
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

      const result = await response.json()

      return result;
    } catch (error) {
      console.error('文章发布错误:', error);
      throw error;
    }
  }

  // 点击外部关闭弹窗
  const handleClickOutside = (event) => {
    // 检查点击是否在弹窗内
    const isClickInTopicPopup = topicSearchRef.value && topicSearchRef.value.contains(event.target)
    const isClickInUserPopup = userSearchRef.value && userSearchRef.value.contains(event.target)
    const isClickInLocationPopup = locationSearchRef.value && locationSearchRef.value.contains(event.target)
    
    // 检查点击是否在按钮上
    const isClickOnTopicButton = event.target.closest('.option-tag') && event.target.closest('.option-tag').querySelector('img[alt="话题"]')
    const isClickOnUserButton = event.target.closest('.option-tag') && event.target.closest('.option-tag').querySelector('img[alt="用户"]')
    const isClickOnLocationButton = event.target.closest('.option-tag') && event.target.closest('.option-tag').querySelector('img[alt="地点"]')

    // 检查点击是否在遮罩层上
    const isClickOnOverlay = event.target.classList.contains('modal-overlay')

    // 如果点击在弹窗外且不在对应的按钮上，则关闭弹窗
    if (showTopicSearch.value && !isClickInTopicPopup && !isClickOnTopicButton) {
      showTopicSearch.value = false
    }
    if (showUserSearch.value && !isClickInUserPopup && !isClickOnUserButton) {
      showUserSearch.value = false
    }
    if (showLocationSearch.value && !isClickInLocationPopup && !isClickOnLocationButton) {
      showLocationSearch.value = false
    }
  }

  // 防抖函数
  const debounce = (fn, delay) => {
    let timer = null
    return function (...args) {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        fn.apply(this, args)
      }, delay)
    }
  }

  // 获取当前位置
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.log('浏览器不支持地理定位');
        reject(new Error('浏览器不支持地理定位'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('获取位置成功:', position);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy // 添加精度信息
          });
        },
        (error) => {
          console.error('获取位置失败:', error);
          // 如果定位失败，使用默认位置（比如学校位置）
          resolve({
            latitude: 32.3937, // 默认纬度
            longitude: 119.4127, // 默认经度
            accuracy: 1000 // 默认精度
          });
        },
        {
          enableHighAccuracy: true, // 使用高精度定位
          timeout: 10000, // 增加超时时间
          maximumAge: 0
        }
      );
    });
  };

  // 搜索地点
  const searchLocation = debounce(async (query) => {
    if (!query) {
      locationResults.value = []
      return
    }

    try {
      // 获取当前位置
      const position = await getCurrentPosition();
      console.log('当前位置:', position);

      // 构建搜索参数
      const params = new URLSearchParams({
        key: 'f811a17e0759c740387656f1aada88dc',
        keywords: query,
        city: '全国',
        extensions: 'all',
        offset: 10,
        page: 1,
        location: `${position.longitude},${position.latitude}`,
        radius: position.accuracy || 50000,
        sortrule: 'distance',
        types: '商务住宅|生活服务|交通设施服务|科教文化服务|医疗保健服务|政府机构及社会团体|风景名胜|购物服务|餐饮服务'
      });

      console.log('搜索参数:', params.toString());

      const response = await fetch(`https://restapi.amap.com/v3/place/text?${params.toString()}`);
      const data = await response.json();
      console.log('搜索响应:', data);

      if (response.ok && data.status === '1' && data.pois && Array.isArray(data.pois)) {
        // 使用 Vue 的响应式更新方法
        const results = data.pois.map(poi => ({
          id: poi.id,
          name: poi.name,
          address: poi.address,
          district: poi.adname,
          type: poi.type,
          distance: poi.distance,
          coordinates: {
            latitude: parseFloat(poi.location.split(',')[1]),
            longitude: parseFloat(poi.location.split(',')[0])
          }
        }));
        console.log('处理的地点信息:', results);
        // 直接赋值整个数组
        locationResults.value = results;
      } else {
        console.log('未找到地点或响应格式错误:', data);
        locationResults.value = [];
      }
    } catch (error) {
      console.error('搜索地点失败:', error);
      locationResults.value = [];
    }
  }, 500);

  // 处理地点选择
  const handleLocationSelect = (location) => {
    console.log('选择地点:', location);
    selectedLocation.value = {
      name: location.name,
      address: location.address,
      district: location.district,
      distance: location.distance,
      coordinates: location.coordinates
    };
    showLocationSearch.value = false;
    locationQuery.value = '';
    locationResults.value = [];
  };

  // 移除地点
  const removeLocation = () => {
    selectedLocation.value = null
  }

  // 发布文章
  const handlePublish = async (publishData) => {
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
        images: uploadedImages,
        location: selectedLocation.value,
        topics: topics.value,
        mentions: mentions.value.map(m => m.id),
        adminMentions: publishData.adminMentions || [] // 从publishData中获取adminMentions
      }

      console.log('usePublish.js - handlePublish - 准备创建文章的数据:', articleData)

      // 3. 发布文章
      const result = await createArticle(articleData)
      console.log('usePublish.js - handlePublish - 文章创建结果:', result)

      return {
        success: true,
        data: result.data
      }
    } catch (error) {
      console.error('发布错误:', error)
      return {
        success: false,
        message: error.message || '发布失败'
      }
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
    showLocationSearch,
    topicQuery,
    userQuery,
    locationQuery,
    availableTopics,
    isPublishing,
    topicSearchRef,
    userSearchRef,
    locationSearchRef,
    selectedLocation,
    locationResults,
    triggerImageInput,
    handleImageSelect,
    removeImage,
    addMention,
    removeMention,
    addTopic,
    removeTopic,
    searchUsers,
    searchLocation,
    handleUserSelect,
    handleTopicSelect,
    handleLocationSelect,
    addCustomTopic,
    handleClickOutside,
    handlePublish,
    removeLocation
  }
} 