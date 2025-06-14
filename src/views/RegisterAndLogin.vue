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
                  <img src="/assets/images/用户名.svg" alt="用户图标"  class="input-icon-img"/>
                </span>
                <input v-model="loginForm.username" type="text" name="username" placeholder="请输入用户名" required />
              </div>
              <div class="input-wrapper">
                <span class="input-icon">
                  <img src="/assets/images/密码.svg" alt="密码"  class="input-icon-img"/>
                </span>
                <input :type="showPassword ? 'text' : 'password'" v-model="loginForm.password" name="password" placeholder="请输入密码" required />
                <span class="password-toggle" data-target="password" @click="togglePassword">
                  <img :src="showPassword ? './assets/images/不显示.svg' : './assets/images/显示.svg'" 
                       :alt="showPassword ? '隐藏' : '显示'" 
                       class="input-icon-img"/>
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
                  <img src="/assets/images/用户名.svg" alt="用户图标"  class="input-icon-img"/>
                </span>
                <input v-model="registerForm.username" type="text" name="username" placeholder="请输入用户名" required />
              </div>
              <div class="input-wrapper">
                <span class="input-icon">
                  <img src="/assets/images/用户名.svg" alt="用户图标"  class="input-icon-img"/>
                </span>
                <input v-model="registerForm.nickname" type="text" name="nickname" placeholder="请输入昵称" required />
              </div>
              <div class="input-wrapper">
                <span class="input-icon">
                  <img src="/assets/images/学号.svg" alt="学号图标"  class="input-icon-img"/>
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
                  <img src="/assets/images/学院.svg" alt="学院图标"  class="input-icon-img"/>
                </span>
                <select 
                  v-model="registerForm.college" 
                  name="college" 
                  required 
                  class="form-input"
                >
                  <option value="">请选择学院</option>
                  <option v-for="college in collegeOptions" :key="college" :value="college">
                    {{ college }}
                  </option>
                </select>
              </div>
              <div class="input-wrapper">
                <span class="input-icon">
                  <img src="/assets/images/密码.svg" alt="密码"  class="input-icon-img"/>                </span>
                <input :type="showPassword ? 'text' : 'password'" v-model="registerForm.password" name="password" placeholder="请输入密码" required />
                <span class="password-toggle" data-target="password" @click="togglePassword">
                  <img :src="showPassword ? './assets/images/不显示.svg' : './assets/images/显示.svg'" 
                       :alt="showPassword ? '隐藏' : '显示'" 
                       class="input-icon-img"/>
                </span>
              </div>
              <div class="input-wrapper">
                <span class="input-icon">
                  <img src="/assets/images/密码.svg" alt="密码"  class="input-icon-img"/>                
                </span>
                <input :type="showConfirmPassword ? 'text' : 'password'" v-model="registerForm.confirmPassword" name="confirmPassword" placeholder="请确认密码" required />
                <span class="password-toggle" data-target="confirmPassword" @click="toggleConfirmPassword">
                  <img :src="showConfirmPassword ? './assets/images/不显示.svg' : './assets/images/显示.svg'" 
                       :alt="showConfirmPassword ? '隐藏' : '显示'" 
                       class="input-icon-img"/>
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
import { computed } from 'vue';
import { collegeOptions } from '../data/colleges';

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

    /* 添加下拉框样式 */
    select.form-input {
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 1rem center;
      background-size: 1em;
      padding-right: 2.5rem;
      width: 100%;
      height: 100%;
      border: none;
      outline: none;
      background-color: transparent;
    }

    select.form-input:focus {
      outline: none;
    }
</style>