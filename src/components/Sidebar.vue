<template>
  <div class="sidebar" id="sidebar">
    <div class="sidebar-menu">
      <a href="/" class="select" @click.prevent="router.push('/')">首页</a>
      <a href="/publish" @click.prevent="router.push('/publish')">发布</a>
      <a href="#message">消息</a>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
@import '../styles/siderbar.css';
</style>