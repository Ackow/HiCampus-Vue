<template>
  <div class="register-and-login-page">
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
            <form v-if="!isRegister" @submit.prevent="handleLogin" class="auth-form">
              <div class="input-group">
                <div class="input-wrapper">
                  <span class="input-icon">
                    <svg width="24" height="24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="4"/><path d="M3 7l9 6 9-6"/></svg>
                  </span>
                  <input type="text" v-model="loginForm.username" placeholder="请输入用户名" required />
                </div>
                <div class="input-wrapper">
                  <span class="input-icon">
                    <svg width="24" height="24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="8" rx="4"/><path d="M12 15v2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
                  </span>
                  <input :type="showPassword ? 'text' : 'password'" v-model="loginForm.password" placeholder="请输入密码" required />
                  <span class="password-toggle" @click="togglePassword">
                    <svg v-if="!showPassword" width="24" height="24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else width="24" height="24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </span>
                </div>
              </div>
              <button type="submit" class="btn primary-btn login-btn">登录</button>
              <p class="registerAndLogin-link" @click="toggleForm">立即注册</p>
            </form>

            <!-- 注册表单 -->
            <form v-else @submit.prevent="handleRegister" class="auth-form">
              <div class="input-group">
                <div class="input-wrapper">
                  <span class="input-icon">
                    <svg width="24" height="24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="4"/><path d="M3 7l9 6 9-6"/></svg>
                  </span>
                  <input type="text" v-model="registerForm.username" placeholder="请输入用户名" required />
                </div>
                <div class="input-wrapper">
                  <span class="input-icon">
                    <svg width="24" height="24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </span>
                  <input type="text" v-model="registerForm.nickname" placeholder="请输入昵称" required />
                </div>
                <div class="input-wrapper">
                  <span class="input-icon">
                    <svg width="24" height="24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="8" rx="4"/><path d="M12 15v2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
                  </span>
                  <input :type="showPassword ? 'text' : 'password'" v-model="registerForm.password" placeholder="请输入密码" required />
                  <span class="password-toggle" @click="togglePassword">
                    <svg v-if="!showPassword" width="24" height="24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else width="24" height="24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </span>
                </div>
                <div class="input-wrapper">
                  <span class="input-icon">
                    <svg width="24" height="24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="8" rx="4"/><path d="M12 15v2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
                  </span>
                  <input :type="showConfirmPassword ? 'text' : 'password'" v-model="registerForm.confirmPassword" placeholder="请确认密码" required />
                  <span class="password-toggle" @click="toggleConfirmPassword">
                    <svg v-if="!showConfirmPassword" width="24" height="24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else width="24" height="24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </span>
                </div>
              </div>
              <button type="submit" class="btn primary-btn register-btn">注册</button>
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
  </div>
</template>

<script setup>
import { useAuth } from '../composables/useAuth'

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
} = useAuth()
</script>

<style>
@import '../styles/registerAndLogin.css';
</style> 