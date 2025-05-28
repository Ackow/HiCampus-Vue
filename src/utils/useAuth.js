import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

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
    password: '',
    confirmPassword: ''
  })

  let updateUICallback = null;

  // 设置回调函数
  const setUpdateUICallback = (callback) => {
    updateUICallback = callback;
  };

  // 更新UI显示
  const updateUI = (isLoggedIn) => {
    if (updateUICallback) {
      updateUICallback(isLoggedIn);
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
        url: `${API_URL}/login`,
        data: {
          username: loginForm.username,
          password: loginForm.password
        }
      })

      const response = await fetch(`${API_URL}/login`, {
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
        localStorage.setItem('token', result.token)
        localStorage.setItem('userInfo', JSON.stringify(result.user))
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

      console.log('开始注册请求:', {
        url: `${API_URL}/register`,
        data: {
          username: registerForm.username,
          password: registerForm.password,
          nickname: registerForm.nickname
        }
      })

      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: registerForm.username,
          password: registerForm.password,
          nickname: registerForm.nickname
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

  // 获取用户信息
  const getUserInfo = () => {
    const userInfo = localStorage.getItem('userInfo')
    return userInfo ? JSON.parse(userInfo) : null
  }

  // 退出登录
  const logout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    updateUI(false)
    router.push('/login')
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
    updateUI
  }
}