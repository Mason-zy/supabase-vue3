import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // 登录相关路由
  {
    path: '/auth',
    component: () => import('@/layouts/BlankLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/system/LoginView.vue'),
        meta: {
          title: '用户登录',
          requiresAuth: false
        }
      },
      {
        path: 'reset-password',
        name: 'ResetPassword',
        component: () => import('@/views/system/ResetPasswordView.vue'),
        meta: {
          title: '重置密码',
          requiresAuth: false
        }
      }
    ]
  },
  // 主应用路由
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: {
          title: '仪表盘',
          icon: 'dashboard'
        }
      },
      {
        path: 'indicators',
        name: 'Indicators',
        component: () => import('@/views/indicators/IndicatorManage.vue'),
        meta: {
          title: '指标管理',
          icon: 'chart-line'
        }
      },
      {
        path: 'accidents',
        name: 'Accidents',
        component: () => import('@/views/accidents/AccidentManage.vue'),
        meta: {
          title: '事故管理',
          icon: 'exclamation-triangle'
        }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/reports/ReportManage.vue'),
        meta: {
          title: '报表中心',
          icon: 'file-alt'
        }
      },
      // 个人中心路由
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/system/UserProfile.vue'),
        meta: {
          title: '个人信息',
          icon: 'user'
        }
      },
      {
        path: 'change-password',
        name: 'ChangePassword',
        component: () => import('@/views/system/ChangePassword.vue'),
        meta: {
          title: '修改密码',
          icon: 'key'
        }
      },
      {
        path: 'system/users',
        name: 'Users',
        component: () => import('@/views/system/UserManage.vue'),
        meta: {
          title: '用户管理',
          icon: 'users'
        }
      },
      {
        path: 'system/roles',
        name: 'Roles',
        component: () => import('@/views/system/RoleManage.vue'),
        meta: {
          title: '角色管理',
          icon: 'user-tag'
        }
      },
      {
        path: 'system/departments',
        name: 'Departments',
        component: () => import('@/views/system/DepartmentManage.vue'),
        meta: {
          title: '部门管理',
          icon: 'sitemap'
        }
      },
      {
        path: 'system/posts',
        name: 'Posts',
        component: () => import('@/views/system/PostManage.vue'),
        meta: {
          title: '岗位管理',
          icon: 'id-card'
        }
      },
      {
        path: 'system/settings',
        name: 'Settings',
        component: () => import('@/views/system/SystemSetting.vue'),
        meta: {
          title: '系统设置',
          icon: 'cog'
        }
      }
    ]
  },
  // 404路由
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/system/NotFoundView.vue'),
    meta: {
      title: '页面未找到',
      requiresAuth: false
    }
  }
]

export default routes 