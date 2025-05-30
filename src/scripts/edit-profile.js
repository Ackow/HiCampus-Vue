import { ref, onMounted } from 'vue'

export function useEditProfile() {
  const avatarUrl = ref('')
  const avatarInput = ref(null)
  const formData = ref({
    username: '',
    nickname: '',
    studentId: '',
    age: '',
    gender: '',
    newPassword: '',
    confirmPassword: ''
  })

  // 加载用户信息
  const loadUserInfo = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (userInfo) {
      formData.value.username = userInfo.username
      formData.value.nickname = userInfo.nickname
      formData.value.studentId = userInfo.studentId
      formData.value.age = userInfo.age
      formData.value.gender = userInfo.gender
      avatarUrl.value = userInfo.avatar || 'http://localhost:3000/uploads/avatars/default-avatar.jpg'
    }
  }

  // 处理头像上传
  const handleAvatarClick = () => {
    avatarInput.value.click()
  }

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0]
    if (file) {
      // 验证文件大小（5MB限制）
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB')
        return
      }

      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        return
      }

      try {
        const formData = new FormData()
        formData.append('avatar', file)

        const response = await fetch('http://localhost:3000/api/user/upload/avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || '上传失败')
        }

        const data = await response.json()
        
        // 更新本地存储中的用户信息
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        const updatedUserInfo = {
          ...userInfo,
          avatar: data.avatar
        }
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo))
        
        // 更新头像显示
        avatarUrl.value = data.avatar

        // 触发自定义事件，通知其他组件更新
        const event = new CustomEvent('userInfoUpdated', { 
          detail: updatedUserInfo,
          bubbles: true,
          composed: true
        })
        window.dispatchEvent(event)

        alert('头像上传成功')
      } catch (error) {
        console.error('头像上传失败:', error)
        alert(error.message || '头像上传失败，请重试')
      }
    }
  }

  // 处理取消编辑
  const handleCancel = () => {
    if (confirm('确定要取消编辑吗？未保存的更改将会丢失。')) {
      window.location.hash = '#profile'
    }
  }

  // 处理保存个人信息
  const handleSave = async () => {
    // 表单验证
    if (!formData.value.nickname) {
      alert('请输入昵称')
      return
    }

    if (formData.value.nickname.length > 6) {
      alert('昵称长度不能超过6位')
      return
    }

    if (formData.value.studentId && formData.value.studentId.length > 20) {
      alert('学号长度不能超过20位')
      return
    }

    if (formData.value.age && (formData.value.age < 1 || formData.value.age > 99)) {
      alert('年龄必须在1-99岁之间')
      return
    }

    if (formData.value.newPassword && formData.value.newPassword !== formData.value.confirmPassword) {
      alert('两次输入的密码不一致')
      return
    }

    const userInfo = JSON.parse(localStorage.getItem('userInfo'))

    // 构建更新数据
    const updateData = {}

    // 检查每个字段是否有变化，有变化才添加到updateData中
    if (formData.value.username && formData.value.username !== userInfo.username) {
      updateData.username = formData.value.username
    }
    if (formData.value.nickname && formData.value.nickname !== userInfo.nickname) {
      updateData.nickname = formData.value.nickname
    }
    if (formData.value.studentId !== userInfo.studentId) {
      updateData.studentId = formData.value.studentId || null
    }
    if (formData.value.age && parseInt(formData.value.age) !== userInfo.age) {
      updateData.age = parseInt(formData.value.age)
    }
    if (formData.value.gender && formData.value.gender !== userInfo.gender) {
      updateData.gender = formData.value.gender
    }
    if (formData.value.newPassword) {
      updateData.password = formData.value.newPassword
    }

    // 如果没有需要更新的字段，提示用户
    if (Object.keys(updateData).length === 0) {
      alert('没有检测到任何修改')
      return
    }

    try {
      const response = await fetch('http://localhost:3000/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      })

      const result = await response.json()

      if (response.ok) {
        // 更新本地存储中的用户信息
        const updatedUserInfo = {
          ...userInfo,
          ...result.user
        }
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo))
        
        // 触发自定义事件，通知其他组件更新
        const event = new CustomEvent('userInfoUpdated', { 
          detail: updatedUserInfo,
          bubbles: true,
          composed: true
        })
        window.dispatchEvent(event)

        alert('保存成功')
        window.location.hash = '#profile'
      } else {
        alert(result.message || '更新失败，请稍后重试')
      }
    } catch (error) {
      console.error('更新用户信息出错:', error)
      alert('更新失败，请检查网络连接后重试')
    }
  }

  // 组件挂载时加载用户信息
  onMounted(() => {
    loadUserInfo()
  })

  return {
    avatarUrl,
    avatarInput,
    formData,
    handleAvatarClick,
    handleAvatarChange,
    handleCancel,
    handleSave
  }
} 