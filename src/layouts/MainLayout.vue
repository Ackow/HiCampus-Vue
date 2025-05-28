<template>
  <div class="main-layout">
    <SiteHeader />
    <Sidebar />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <keep-alive :include="['Home']">
            <component :is="Component" />
          </keep-alive>
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import SiteHeader from '../components/SiteHeader.vue'
import Sidebar from '../components/Sidebar.vue'
</script>

<style scoped>
.main-layout {
  width: 100%;
  min-height: 100vh;
  display: flex;
  position: relative;
  background-color: #ffffff;
  max-width: 2000px;
  margin: 0 auto;
}

.main-content {
  flex: 1;
  margin-top: 80px;
  min-height: calc(100vh - 80px);
  width: 100%;
  max-width: 1700px;
  box-sizing: border-box;
  margin-left: auto;
  margin-right: auto;
  padding: 0 20px;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 