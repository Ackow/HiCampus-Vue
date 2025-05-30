import { ref } from 'vue'

const searchEvent = ref(null)

export const eventBus = {
  emitSearch(keyword) {
    searchEvent.value = keyword
  },
  onSearch(callback) {
    return searchEvent
  }
} 