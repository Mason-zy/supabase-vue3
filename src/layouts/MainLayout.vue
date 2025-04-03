<template>
  <div class="main-layout">
    <!-- 左侧导航 -->
    <aside class="sidebar" :class="{ 'is-collapsed': isCollapsed }">
      <div class="logo">
        <div class="logo-icon">JB</div>
        <span v-if="!isCollapsed" class="logo-text">京博石化绩效指标系统</span>
      </div>
      
      <div class="menu-container">
        <el-menu
          class="menu"
          background-color="#1A365D"
          text-color="#fff"
          active-text-color="#F47B20"
          :default-active="activeMenu"
          :collapse="isCollapsed"
          router
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>
          
          <el-sub-menu index="/indicators">
            <template #title>
              <el-icon><Odometer /></el-icon>
              <span>指标管理</span>
            </template>
            <el-menu-item index="/indicators">指标概览</el-menu-item>
            <el-menu-item index="/indicators/detail">指标明细</el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="/accidents">
            <template #title>
            <el-icon><Warning /></el-icon>
              <span>事故管理</span>
            </template>
            <el-menu-item index="/accidents">事故列表</el-menu-item>
            <el-menu-item index="/accidents/report">事故上报</el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="/reports">
            <template #title>
            <el-icon><Document /></el-icon>
              <span>报表中心</span>
            </template>
            <el-menu-item index="/reports">报表查询</el-menu-item>
            <el-menu-item index="/reports/generate">报表生成</el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="/system">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/system/users">用户管理</el-menu-item>
            <el-menu-item index="/system/roles">角色管理</el-menu-item>
            <el-menu-item index="/system/departments">部门管理</el-menu-item>
            <el-menu-item index="/system/posts">岗位管理</el-menu-item>
            <el-menu-item index="/system/settings">系统设置</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
        
      <el-button class="sidebar-collapse-btn" text @click="toggleSidebar">
        <el-icon v-if="isCollapsed"><Expand /></el-icon>
        <el-icon v-else><Fold /></el-icon>
      </el-button>
    </aside>
      
    <!-- 主区域 -->
    <main class="main-content">
      <!-- 顶部导航 -->
      <header class="header">
        <div class="header-left">
          <el-button text @click="toggleSidebar">
            <el-icon><Menu /></el-icon>
          </el-button>
          <router-link to="/" class="home-link">首页</router-link>
          <span v-if="!isRootRoute">/</span>
          <span v-if="currentRouteParent">{{ currentRouteParent }}</span>
          <span v-if="currentRouteParent && currentRouteName">/</span>
          <span>{{ currentRouteName }}</span>
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" class="user-avatar">
                {{ userAvatarText }}
              </el-avatar>
              <span class="username">{{ userName }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      
      <!-- 内容区域 -->
      <div class="content-container">
        <div class="content-card">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
        </div>
      </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/system/auth'
import { ElMessageBox } from 'element-plus'
import { 
  HomeFilled, 
  Odometer, 
  Warning, 
  Document, 
  Setting,
  Expand,
  Fold,
  Menu
} from '@element-plus/icons-vue'

// 路由与认证
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 用户信息
const userName = computed(() => {
  return authStore.userProfile?.nickname || 
         authStore.userProfile?.email?.split('@')[0] || 
         authStore.user?.email?.split('@')[0] || 
         '用户'
})

const userAvatarText = computed(() => {
  if (authStore.userProfile?.nickname) {
    return authStore.userProfile.nickname.substring(0, 1)
  }
  if (authStore.userProfile?.email) {
    return authStore.userProfile.email.substring(0, 1).toUpperCase()
  }
  if (authStore.user?.email) {
    return authStore.user.email.substring(0, 1).toUpperCase()
  }
  return '用'
})

// 侧边栏折叠状态
const isCollapsed = ref(false)

// 计算当前路由名称（中文）
const routeNameMap: Record<string, string> = {
  'Dashboard': '仪表盘',
  'Indicators': '指标管理',
  'Accidents': '事故管理',
  'Reports': '报表中心',
  'Users': '用户管理',
  'Roles': '角色管理',
  'Settings': '系统设置',
  'UserProfile': '个人信息',
  'ChangePassword': '修改密码',
  'Departments': '部门管理',
  'Posts': '岗位管理'
}

// 路由父级名称映射
const routeParentMap: Record<string, string> = {
  'Users': '系统管理',
  'Roles': '系统管理',
  'Settings': '系统管理',
  'Departments': '系统管理',
  'Posts': '系统管理'
}

// @ts-ignore - currentRoute用于以后的扩展功能
const currentRoute = ref(router.currentRoute.value)
const isRootRoute = computed(() => route.path === '/')

const currentRouteName = computed(() => {
  const name = route.name as string
  return routeNameMap[name] || name
})

const currentRouteParent = computed(() => {
  const name = route.name as string
  return routeParentMap[name] || null
})

// 计算当前激活的菜单项
const activeMenu = computed(() => {
  if (route.path.startsWith('/system')) {
    // 对于系统管理子菜单，保持子菜单项激活状态
    return route.path
  }
  
  const paths = route.path.split('/')
  if (paths.length > 1 && paths[1]) {
    // 对于其他一级路由，只激活一级菜单
    return '/' + paths[1]
  }
  
  return route.path
})

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

// 处理下拉菜单命令
const handleCommand = async (command: string) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm(
        '确定要退出系统吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      
      const result = await authStore.logout()
      if (result.success) {
        router.push({ name: 'Login' })
      }
    } catch {
      // 用户取消操作
    }
  } else if (command === 'profile') {
    router.push({ name: 'UserProfile' })
  } else if (command === 'password') {
    router.push({ name: 'ChangePassword' })
  }
}
</script>

<style scoped lang="scss">
.main-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  
  .sidebar {
    width: 240px;
    min-width: 240px;
    background-color: #1A365D;
    color: white;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: all 0.3s ease-in-out;
    
    &.is-collapsed {
      width: 64px;
      min-width: 64px;
      
      .logo {
        padding: 16px 0;
        justify-content: center;
        
        .logo-icon {
          margin-right: 0;
        }
      }
      
      .sidebar-collapse-btn {
        left: auto;
        right: -16px;
        transform: translateY(-50%);
      }
    }
    
    .logo {
      display: flex;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      
      .logo-icon {
        width: 32px;
        height: 32px;
        background-color: #F47B20;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        margin-right: 10px;
      }
      
      .logo-text {
        font-size: 16px;
        font-weight: 500;
        white-space: nowrap;
      }
    }
    
    .menu-container {
      flex: 1;
      overflow-y: auto;
      padding-top: 10px;
      
      .menu {
        border-right: none;
        
        :deep(.el-menu-item) {
          &.is-active {
            background-color: rgba(244, 123, 32, 0.1);
            
            &::before {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              width: 3px;
              height: 100%;
              background-color: #F47B20;
            }
          }
        }
        
        :deep(.el-sub-menu__title) {
          &:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }
        }
      }
    }
    
    .sidebar-collapse-btn {
      position: absolute;
      top: 50%;
      right: -16px;
      transform: translateY(-50%);
      color: #1A365D;
      width: 32px;
      height: 32px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: white;
      border-radius: 50%;
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.15);
      z-index: 100;
      transition: all 0.3s ease-in-out;
      
      &:hover {
        background-color: #f5f5f5;
        transform: translateY(-50%) scale(1.1);
      }
    }
  }
  
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: #f8f9fa;
    transition: all 0.3s ease-in-out;
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
      height: 60px;
      background-color: white;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 10;
      
      .header-left {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .home-link {
          text-decoration: none;
          color: #1A365D;
        }
      }
      
      .header-right {
        .user-info {
          display: flex;
          align-items: center;
          cursor: pointer;
          
          .user-avatar {
            background-color: #1A365D;
            color: white;
            font-size: 14px;
            margin-right: 8px;
        }
        
        .username {
          font-size: 14px;
          color: #333;
        }
      }
    }
  }
  
    .content-container {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      
      .content-card {
        background-color: white;
        min-height: calc(100% - 40px);
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
        padding: 20px;
      }
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 