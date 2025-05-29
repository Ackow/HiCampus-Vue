<template>
  <div class="container">
    <div class="left-panel">
      <h1 class="logo">HiCampus</h1>
      <div class="slogan-section">
        <p class="slogan-hi">· 嗨!</p>
        <p class="slogan-text">这里是你的大学。</p>
      </div>
    </div>
    <div class="right-panel">
      <div class="action-section">
        <p class="start-text">开始使用</p>
        <div class="form-container">
          <!-- 登录表单 -->
          <form :id="'loginForm'" class="auth-form" v-if="isLogin">
            <div class="input-group">
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="24" height="24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="4"/><path d="M3 7l9 6 9-6"/></svg>
                </span>
                <input v-model="loginForm.username" type="text" name="username" placeholder="请输入用户名" required />
              </div>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="24" height="24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="8" rx="4"/><path d="M12 15v2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
                </span>
                <input :type="showPassword ? 'text' : 'password'" v-model="loginForm.password" name="password" placeholder="请输入密码" required />
                <span class="password-toggle" data-target="password" @click="togglePassword">
                  <svg width="24" height="24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </span>
              </div>
            </div>
            <button type="submit" class="btn primary-btn login-btn" @click.prevent="handleLogin">登录</button>
            <p class="registerAndLogin-link" @click="toggleForm">立即注册</p>
          </form>

          <!-- 注册表单 -->
          <form :id="'registerForm'" class="auth-form" v-else>
            <div class="input-group">
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="24" height="24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="4"/><path d="M3 7l9 6 9-6"/></svg>
                </span>
                <input v-model="registerForm.username" type="text" name="username" placeholder="请输入用户名" required />
              </div>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="24" height="24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
                <input v-model="registerForm.nickname" type="text" name="nickname" placeholder="请输入昵称" required />
              </div>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="24" height="24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </span>
                <input 
                  v-model="registerForm.studentId" 
                  type="text" 
                  name="studentId" 
                  placeholder="请输入学号" 
                  required 
                  maxlength="8"
                  pattern="[0-9]{8}"
                  title="请输入8位数字学号"
                />
              </div>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="24" height="24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15v2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
                </span>
                <input :type="showPassword ? 'text' : 'password'" v-model="registerForm.password" name="password" placeholder="请输入密码" required />
                <span class="password-toggle" data-target="password" @click="togglePassword">
                  <svg width="24" height="24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </span>
              </div>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg width="24" height="24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15v2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
                </span>
                <input :type="showConfirmPassword ? 'text' : 'password'" v-model="registerForm.confirmPassword" name="confirmPassword" placeholder="请确认密码" required />
                <span class="password-toggle" data-target="confirmPassword" @click="toggleConfirmPassword">
                  <svg width="24" height="24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </span>
              </div>
            </div>
            <button type="submit" class="btn primary-btn register-btn" @click.prevent="handleRegister">注册</button>
            <p class="registerAndLogin-link" @click="toggleForm">返回登录</p>
          </form>
        </div>
      </div>
      <div class="footer-info">
        <span class="footer-logo">HC</span>
        <p class="terms-privacy">使用条款 | 隐私政策</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '../utils/useAuth.js';
// 导入 computed 函数
import { computed } from 'vue';

// 从 useAuth 中解构出需要的方法和状态
const { 
    isRegister, 
    showPassword, 
    showConfirmPassword, 
    loginForm, 
    registerForm, 
    toggleForm, 
    togglePassword, 
    toggleConfirmPassword, 
    handleLogin, 
    handleRegister 
} = useAuth();

const isLogin = computed(() => !isRegister.value);
</script>

<style scoped>
    @import '../styles/RegisterAndLogin.css';
</style>