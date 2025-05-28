<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'

const route = useRoute()
const showHeader = computed(() => route.meta.showHeader !== false)
</script>

<template>
  <div class="app-container">
    <Header v-if="showHeader" />
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
