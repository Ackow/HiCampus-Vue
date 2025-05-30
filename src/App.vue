<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'
import { eventBus } from './utils/eventBus.js'

const route = useRoute()
const showHeader = computed(() => route.meta.showHeader !== false)
const currentComponent = ref(null)

const handleSearch = (keyword) => {
  console.log('App: 收到搜索事件:', keyword)
  // 使用事件总线发送搜索事件
  eventBus.emitSearch(keyword)
}
</script>

<template>
  <div class="app-container">
    <Header v-if="showHeader" @search="handleSearch" />
    <div class="main-layout">
      <router-view />
    </div>
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-layout {
  flex: 1;
  display: flex;
  /* margin-top: 4rem; */
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
