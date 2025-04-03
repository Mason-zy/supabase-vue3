import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/system/auth'

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 更新页面标题
  document.title = `${to.meta.title || '京博石油化工'} - 绩效指标体系电子系统`
  
  const authStore = useAuthStore()
  const { isAuthenticated, user } = storeToRefs(authStore)
  
  // 如果用户状态未初始化，则先初始化
  if (user.value === null) {
    await authStore.initialize()
  }
  
  // 检查该路由是否需要身份验证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (requiresAuth && !isAuthenticated.value) {
    // 如果需要登录但用户未登录，重定向到登录页面
    next({
      name: 'Login',
      query: { redirect: to.fullPath } // 保存原本要访问的地址
    })
  } else if (to.path === '/auth/login' && isAuthenticated.value) {
    // 如果用户已登录但访问登录页，则重定向到首页
    next({ name: 'Dashboard' })
  } else {
    // 其他情况正常访问
    next()
  }
})

export default router 