import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

export function useSearch() {
  const searchActive = ref(false)
  const searchInput = ref(null)
  const searchInputWrapper = ref(null)
  const searchTriggerButton = ref(null)
  const searchArea = ref(null)

  function openSearch() {
    searchActive.value = true
    nextTick(() => {
      searchInput.value && searchInput.value.focus()
    })
  }

  function closeSearch() {
    searchActive.value = false
  }

  function handleClickOutside(e) {
    if (
      searchActive.value &&
      searchInputWrapper.value &&
      !searchInputWrapper.value.contains(e.target) &&
      searchTriggerButton.value &&
      e.target !== searchTriggerButton.value
    ) {
      closeSearch()
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  return {
    searchActive,
    searchInput,
    searchInputWrapper,
    searchTriggerButton,
    searchArea,
    openSearch,
    closeSearch
  }
} 