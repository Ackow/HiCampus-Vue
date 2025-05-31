import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// API配置
const API_URL = 'http://localhost:3000/api'

export function useAuth() {
  const router = useRouter()
  const isRegister = ref(false)
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)

  const loginForm = reactive({
    username: '',
    password: ''
  })

  const registerForm = reactive({
    username: '',
    nickname: '',
    studentId: '',
    password: '',
    confirmPassword: ''
  })

  let updateUICallback = null;

  const token = ref(localStorage.getItem('token'))
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  // 设置回调函数
  const setUpdateUICallback = (callback) => {
    updateUICallback = callback;
  };

  // 更新UI显示
  const updateUI = (isLoggedIn) => {
    if (updateUICallback) {
      updateUICallback(isLoggedIn);
    }
    // 触发用户信息更新事件
    const userInfo = getUserInfo();
    if (userInfo) {
      const event = new CustomEvent('userInfoUpdated', {
        detail: userInfo,
        bubbles: true,
        composed: true
      });
      window.dispatchEvent(event);
    }
  };

  const toggleForm = () => {
    isRegister.value = !isRegister.value
  }

  const togglePassword = () => {
    showPassword.value = !showPassword.value
  }

  const toggleConfirmPassword = () => {
    showConfirmPassword.value = !showConfirmPassword.value
  }

  const handleLogin = async () => {
    try {
      console.log('开始登录请求:', {
        url: `${API_URL}/user/login`,
        data: {
          username: loginForm.username,
          password: loginForm.password
        }
      })

      const response = await fetch(`${API_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: loginForm.username,
          password: loginForm.password
        })
      })

      console.log('服务器响应状态:', response.status)
      const result = await response.json()
      console.log('服务器响应数据:', result)

      if (response.ok) {
        // 保存token和用户信息
        setToken(result.token)
        // 确保头像URL是完整的
        const userData = {
          ...result.user,
          avatar: result.user.avatar || 'http://localhost:3000/uploads/avatars/default-avatar.jpg'
        };
        setUserInfo(userData)
        localStorage.setItem('isLoggedIn', 'true')
        
        // 更新UI显示
        updateUI(true)
        
        // 登录成功后跳转到首页
        router.push('/')
      } else {
        alert(result.message || '登录失败')
      }
    } catch (error) {
      console.error('登录错误:', error)
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack
      })
      alert('登录失败，请稍后重试')
    }
  }

  const handleRegister = async () => {
    try {
      if (registerForm.password !== registerForm.confirmPassword) {
        alert('两次输入的密码不一致')
        return
      }

      // 验证学号
      if (!registerForm.studentId) {
        alert('请输入学号')
        return
      }

      if (!/^\d{8}$/.test(registerForm.studentId)) {
        alert('学号必须是8位数字')
        return
      }

      console.log('开始注册请求:', {
        url: `${API_URL}/user/register`,
        data: {
          username: registerForm.username,
          password: registerForm.password,
          nickname: registerForm.nickname,
          studentId: registerForm.studentId
        }
      })

      const response = await fetch(`${API_URL}/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: registerForm.username,
          password: registerForm.password,
          nickname: registerForm.nickname,
          studentId: registerForm.studentId
        })
      })

      console.log('服务器响应状态:', response.status)
      const result = await response.json()
      console.log('服务器响应数据:', result)

      if (response.ok) {
        // 注册成功后切换到登录表单
        isRegister.value = false
        alert('注册成功，请登录')
      } else {
        alert(result.message || '注册失败')
      }
    } catch (error) {
      console.error('注册错误:', error)
      console.error('错误详情:', {
        message: error.message,
        stack: error.stack
      })
      alert('注册失败，请稍后重试')
    }
  }

  // 检查登录状态
  const checkLoginStatus = () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    updateUI(isLoggedIn)
    return isLoggedIn
  }

  // 获取 token
  const getToken = () => {
    return localStorage.getItem('token')
  }

  // 设置 token
  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  // 获取用户信息
  const getUserInfo = () => {
    return JSON.parse(localStorage.getItem('userInfo') || 'null')
  }

  // 设置用户信息
  const setUserInfo = (info) => {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  // 清除认证信息
  const clearAuth = () => {
    token.value = null
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  // 检查是否已登录
  const isAuthenticated = () => {
    return !!getToken()
  }

  // 退出登录
  const logout = () => {
    // 清除所有本地存储
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    
    // 更新UI状态
    updateUI(false)
    
    // 退出登录后，触发用户信息更新事件
    const userInfo = getUserInfo();
    if (userInfo) {
      const event = new CustomEvent('userInfoUpdated', {
        detail: null,
        bubbles: true,
        composed: true
      });
      window.dispatchEvent(event);
    }
    
    // 导航到首页
    router.push('/')
  }

  return {
    isRegister,
    showPassword,
    showConfirmPassword,
    loginForm,
    registerForm,
    toggleForm,
    togglePassword,
    toggleConfirmPassword,
    handleLogin,
    handleRegister,
    checkLoginStatus,
    getUserInfo,
    logout,
    setUpdateUICallback,
    updateUI,
    token,
    userInfo,
    getToken,
    setToken,
    setUserInfo,
    clearAuth,
    isAuthenticated
  }
}