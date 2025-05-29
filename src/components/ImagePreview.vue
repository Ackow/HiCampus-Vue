<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="image-preview-overlay" @click.self="close">
        <div class="image-preview-container">
          <button class="close-btn" @click="close">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="preview-content">
            <button 
              class="nav-btn prev-btn" 
              v-if="currentIndex > 0" 
              @click="prevImage"
            >
              <img src="/assets/images/翻页1.svg" alt="上一张" class="nav-icon">
            </button>
            
            <div class="image-wrapper">
              <img 
                :src="currentImage" 
                :alt="'预览图片 ' + (currentIndex + 1)"
                class="preview-image"
                @click="close"
              >
            </div>
            
            <button 
              class="nav-btn next-btn" 
              v-if="currentIndex < images.length - 1" 
              @click="nextImage"
            >
              <img src="/assets/images/翻页2.svg" alt="下一张" class="nav-icon">
            </button>
          </div>
          
          <div class="preview-footer">
            <span class="image-counter">{{ currentIndex + 1 }} / {{ images.length }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  images: {
    type: Array,
    required: true
  },
  initialIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close'])

const currentIndex = ref(props.initialIndex)

const currentImage = computed(() => props.images[currentIndex.value])

const close = () => {
  emit('close')
}

const prevImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
  }
}

// 监听键盘事件
const handleKeydown = (e) => {
  if (!props.show) return
  
  switch (e.key) {
    case 'Escape':
      close()
      break
    case 'ArrowLeft':
      prevImage()
      break
    case 'ArrowRight':
      nextImage()
      break
  }
}

// 添加和移除键盘事件监听
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-preview-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  z-index: 1;
}

.preview-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-wrapper {
  max-width: 90%;
  max-height: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  cursor: zoom-out;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 1;
}

.nav-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.prev-btn {
  left: 20px;
}

.next-btn {
  right: 20px;
}

.nav-icon {
  width: 24px;
  height: 24px;
  filter: brightness(0) invert(1);
}

.preview-footer {
  position: absolute;
  bottom: 20px;
  color: white;
  font-size: 14px;
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