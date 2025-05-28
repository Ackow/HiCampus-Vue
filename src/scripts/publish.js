import { ref } from 'vue'

export function usePublish(imageInput) {
  const images = ref([])

  // 触发文件选择
  const triggerImageInput = () => {
    imageInput.value.click()
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
      const response = await fetch('http://localhost:3000/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(articleData)
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

  return {
    images,
    triggerImageInput,
    handleImageSelect,
    removeImage,
    uploadImage,
    createArticle
  }
} 