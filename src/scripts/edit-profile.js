import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { collegeOptions } from '../data/colleges'

export function useEditProfile() {
  const avatarUrl = ref('')
  const avatarInput = ref(null)
  const isLoading = ref(false)
  const formData = ref({
    username: '',
    nickname: '',
    studentId: '',
    college: '',
    age: '',
    gender: '',
    newPassword: '',
    confirmPassword: ''
  })

  // 加载用户信息
  const loadUserInfo = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.error('请先登录')
      return
    }

    isLoading.value = true
    try {
      const response = await fetch('http://localhost:3000/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          const userData = {
            ...data.user,
            _id: data.user.id
          }
          
          // 更新表单数据
          formData.value = {
            username: userData.username || '',
            nickname: userData.nickname || '',
            studentId: userData.studentId || '',
            college: userData.college || '',
            age: userData.age || '',
            gender: userData.gender || '',
            newPassword: '',
            confirmPassword: ''
          }
          
          // 更新头像
          avatarUrl.value = userData.avatar || 'http://localhost:3000/uploads/avatars/default-avatar.jpg'
          
          // 触发用户信息更新事件
          const event = new CustomEvent('userInfoUpdated', { 
            detail: userData,
            bubbles: true,
            composed: true
          })
          window.dispatchEvent(event)
        }
      } else {
        const errorData = await response.json()
        console.error('获取用户信息失败:', errorData)
        ElMessage.error(errorData.message || '获取用户信息失败')
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      ElMessage.error('获取用户信息失败，请检查网络连接')
    } finally {
      isLoading.value = false
    }
  }

  // 处理头像上传
  const handleAvatarClick = () => {
    if (isLoading.value) return
    avatarInput.value.click()
  }

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // 验证文件大小（5MB限制）
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.error('图片大小不能超过5MB')
      return
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      ElMessage.error('请选择图片文件')
      return
    }

    isLoading.value = true
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
      
      // 更新头像显示
      avatarUrl.value = data.avatar

      // 触发用户信息更新事件
      const event = new CustomEvent('userInfoUpdated', { 
        detail: { ...formData.value, avatar: data.avatar },
        bubbles: true,
        composed: true
      })
      window.dispatchEvent(event)

      ElMessage.success('头像上传成功')
    } catch (error) {
      console.error('头像上传失败:', error)
      ElMessage.error(error.message || '头像上传失败，请重试')
    } finally {
      isLoading.value = false
    }
  }

  // 处理取消编辑
  const handleCancel = () => {
    if (isLoading.value) return
    if (confirm('确定要取消编辑吗？未保存的更改将会丢失。')) {
      window.location.hash = '#profile'
    }
  }

  // 处理保存个人信息
  const handleSave = async () => {
    if (isLoading.value) return

    // 表单验证
    if (!formData.value.nickname) {
      ElMessage.error('请输入昵称')
      return
    }

    if (formData.value.nickname.length > 6) {
      ElMessage.error('昵称长度不能超过6位')
      return
    }

    if (formData.value.studentId && formData.value.studentId.length > 20) {
      ElMessage.error('学号长度不能超过20位')
      return
    }

    if (formData.value.age && (formData.value.age < 1 || formData.value.age > 99)) {
      ElMessage.error('年龄必须在1-99岁之间')
      return
    }

    if (formData.value.newPassword && formData.value.newPassword !== formData.value.confirmPassword) {
      ElMessage.error('两次输入的密码不一致')
      return
    }

    isLoading.value = true
    try {
      const response = await fetch('http://localhost:3000/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          nickname: formData.value.nickname,
          studentId: formData.value.studentId || null,
          college: formData.value.college,
          age: formData.value.age ? parseInt(formData.value.age) : null,
          gender: formData.value.gender,
          password: formData.value.newPassword || undefined
        })
      })

      const result = await response.json()

      if (response.ok) {
        // 触发用户信息更新事件
        const event = new CustomEvent('userInfoUpdated', { 
          detail: { ...formData.value },
          bubbles: true,
          composed: true
        })
        window.dispatchEvent(event)

        ElMessage.success('保存成功')
        window.location.hash = '#profile'
      } else {
        ElMessage.error(result.message || '更新失败，请稍后重试')
      }
    } catch (error) {
      console.error('更新用户信息出错:', error)
      ElMessage.error('更新失败，请检查网络连接后重试')
    } finally {
      isLoading.value = false
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
    isLoading,
    collegeOptions,
    handleAvatarClick,
    handleAvatarChange,
    handleCancel,
    handleSave
  }
} 