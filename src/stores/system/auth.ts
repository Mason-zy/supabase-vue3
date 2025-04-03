import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref(null)
  const isAuthenticated = ref(false)

  // 方法
  function setUser(userData) {
    user.value = userData
    isAuthenticated.value = !!userData
  }

  function clearUser() {
    user.value = null
    isAuthenticated.value = false
  }

  return {
    user,
    isAuthenticated,
    setUser,
    clearUser
  }
}) 