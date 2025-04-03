import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue')
      },
      {
        path: 'indicators',
        name: 'indicators',
        component: () => import('@/views/indicators/IndicatorManage.vue')
      },
      {
        path: 'accidents',
        name: 'accidents',
        component: () => import('@/views/accidents/AccidentManage.vue')
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('@/views/reports/ReportManage.vue')
      },
      {
        path: 'system/users',
        name: 'users',
        component: () => import('@/views/system/UserManage.vue')
      },
      {
        path: 'system/roles',
        name: 'roles',
        component: () => import('@/views/system/RoleManage.vue')
      },
      {
        path: 'system/settings',
        name: 'settings',
        component: () => import('@/views/system/SystemSetting.vue')
      }
    ]
  }
]

export default routes 