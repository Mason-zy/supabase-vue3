import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@supabase/supabase-js'
import authService, { type LoginCredentials, type RegisterData } from '@/services/supabase/auth'
import supabase from '@/services/supabase/client'

// 定义用户信息接口
interface UserProfile {
  id: string;
  email: string;
  last_sign_in_at: string;
  nickname: string;
  mobile: string;
  avatar: string;
  gender: number;
  status: number;
  dept_id: number;
  dept_name: string;
  dept_code: string;
  post_names: string;
  role_names: string;
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const userProfile = ref<UserProfile | null>(null)
  const userRoles = ref<string[]>([])
  const isAuthenticated = computed(() => !!user.value)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 获取当前用户个人信息
   */
  const fetchUserProfile = async () => {
    try {
      // 获取当前用户的基本信息
      const { data: userData, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError
      
      if (!userData?.user) {
        return { success: false, error: '未找到用户信息' }
      }
      
      // 尝试通过RPC获取完整用户信息
      try {
        // 首先尝试通过RPC获取完整信息
        const { data: profileData, error: rpcError } = await supabase.rpc('get_current_user_info')
        
        if (!rpcError && profileData) {
          // 确保数据是单个对象而不是数组
          const profileInfo = Array.isArray(profileData) ? profileData[0] : profileData
          userProfile.value = profileInfo as UserProfile
          userRoles.value = profileInfo.role_names ? profileInfo.role_names.split(', ') : []
          return { success: true, data: profileInfo }
        }
        
        // 如果RPC调用失败，记录错误但继续
        console.warn('无法通过RPC获取用户详细信息:', rpcError)
      } catch (rpcErr) {
        console.warn('RPC调用异常:', rpcErr)
      }
      
      // 如果RPC获取失败，使用基本用户信息
      const basicProfile = {
        id: userData.user.id,
        email: userData.user.email || '',
        last_sign_in_at: userData.user.last_sign_in_at || '',
        nickname: userData.user.user_metadata?.nickname || userData.user.email?.split('@')[0] || '',
        mobile: userData.user.user_metadata?.mobile || '',
        avatar: userData.user.user_metadata?.avatar || '',
        gender: userData.user.user_metadata?.gender || 0,
        status: 1,
        dept_id: 0,
        dept_name: '',
        dept_code: '',
        post_names: '',
        role_names: ''
      } as UserProfile
      
      userProfile.value = basicProfile
      return { success: true, data: basicProfile }
    } catch (err: any) {
      console.error('获取用户信息失败:', err)
      return { success: false, error: err.message || '获取用户信息失败' }
    }
  }

  /**
   * 初始化认证状态
   */
  const initialize = async () => {
    loading.value = true
    error.value = null
    
    try {
      // 获取当前会话
      const session = await authService.getSession()
      if (session) {
        user.value = session.user
        // 获取用户角色和个人信息
        await fetchUserProfile()
      } else {
        user.value = null
        userProfile.value = null
        userRoles.value = []
      }
    } catch (err) {
      console.error('认证初始化失败:', err)
      error.value = '认证初始化失败'
      user.value = null
      userProfile.value = null
      userRoles.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * 登录
   */
  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: authError } = await authService.signIn(credentials)
      
      if (authError) {
        throw authError
      }
      
      user.value = data.user
      // 登录成功后获取用户信息
      await fetchUserProfile()
      return { success: true }
    } catch (err: any) {
      console.error('登录失败:', err)
      error.value = err.message || '登录失败'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * 注册
   */
  const register = async (data: RegisterData) => {
    loading.value = true
    error.value = null
    
    try {
      const { data: authData, error: authError } = await authService.signUp(data)
      
      if (authError) {
        throw authError
      }
      
      user.value = authData.user
      // 注册成功后获取用户信息
      await fetchUserProfile()
      return { success: true }
    } catch (err: any) {
      console.error('注册失败:', err)
      error.value = err.message || '注册失败'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * 修改密码
   */
  const updatePassword = async (password: string) => {
    loading.value = true
    error.value = null
    
    try {
      const { error: updateError } = await authService.updatePassword(password)
      
      if (updateError) {
        throw updateError
      }
      
      return { success: true }
    } catch (err: any) {
      console.error('修改密码失败:', err)
      error.value = err.message || '修改密码失败'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * 登出
   */
  const logout = async () => {
    loading.value = true
    
    try {
      const { error: authError } = await authService.signOut()
      
      if (authError) {
        throw authError
      }
      
      user.value = null
      userProfile.value = null
      userRoles.value = []
      return { success: true }
    } catch (err: any) {
      console.error('登出失败:', err)
      error.value = err.message || '登出失败'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // 角色判断助手函数
  const hasRole = (roleKey: string) => {
    return userRoles.value.includes(roleKey)
  }

  const isAdmin = computed(() => {
    return userRoles.value.some(role => role === 'admin')
  })

  // 设置认证状态变化监听
  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session ? session.user : null
    if (!session) {
      userProfile.value = null
      userRoles.value = []
    } else if (session && !userProfile.value) {
      // 如果有会话但没有用户信息，则获取用户信息
      fetchUserProfile()
    }
  })

  return {
    user,
    userProfile,
    userRoles,
    isAuthenticated,
    loading,
    error,
    hasRole,
    isAdmin,
    initialize,
    login,
    register,
    logout,
    updatePassword,
    fetchUserProfile
  }
}) 