<template>
  <div class="sidebar" :class="{ active: isActive }">
    <div class="sidebar-menu">
      <router-link to="/" class="menu-item" :class="{ active: currentRoute === '/' }">首页</router-link>
      <router-link to="/publish" class="menu-item" :class="{ active: currentRoute === '/publish' }">发布</router-link>
      <router-link to="/message" class="menu-item" :class="{ active: currentRoute === '/message' }">消息</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isActive = ref(true)

const currentRoute = computed(() => route.path)
</script>

<style>
@import '../styles/sidebar.css';
</style> 