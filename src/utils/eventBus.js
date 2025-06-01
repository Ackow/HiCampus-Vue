import { ref } from 'vue'

const searchEvent = ref(null)
const listeners = new Map()

export const eventBus = {
  emitSearch(keyword) {
    searchEvent.value = keyword
  },
  onSearch(callback) {
    return searchEvent
  },
  // 添加事件监听
  on(event, callback) {
    if (!listeners.has(event)) {
      listeners.set(event, new Set())
    }
    listeners.get(event).add(callback)
  },
  // 移除事件监听
  off(event, callback) {
    if (listeners.has(event)) {
      listeners.get(event).delete(callback)
    }
  },
  // 触发事件
  emit(event, data) {
    if (listeners.has(event)) {
      listeners.get(event).forEach(callback => callback(data))
    }
  }
} 