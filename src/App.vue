<script setup>
import SiteHeader from './components/SiteHeader.vue'
import Sidebar from './components/Sidebar.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const isMainLayout = computed(() => route.path !== '/login')
</script>

<template>
  <div class="app-container">
    <router-view>
    </router-view>
  </div>
</template>

<style>
@import './styles/layout.css';

</style>
