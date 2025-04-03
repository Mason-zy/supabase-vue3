<template>
  <div class="user-profile">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2>个人信息</h2>
        </div>
      </template>

      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="userProfile" class="profile-content">
        <div class="avatar-section">
          <el-avatar 
            :size="100" 
            :src="userProfile.avatar || ''" 
            :alt="userProfile.nickname || userProfile.email"
          >
            {{ getAvatarText() }}
          </el-avatar>
          <h3>{{ userProfile.nickname || userProfile.email }}</h3>
          <div class="user-roles">
            <el-tag 
              v-for="role in userRoles" 
              :key="role" 
              class="role-tag"
            >
              {{ role }}
            </el-tag>
          </div>
        </div>

        <el-divider />

        <div class="info-section">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="邮箱">
              {{ userProfile.email }}
            </el-descriptions-item>
            <el-descriptions-item label="昵称">
              {{ userProfile.nickname || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="手机">
              {{ userProfile.mobile || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="性别">
              {{ formatGender(userProfile.gender) }}
            </el-descriptions-item>
            <el-descriptions-item label="部门">
              {{ userProfile.dept_name || '未分配' }}
            </el-descriptions-item>
            <el-descriptions-item label="岗位">
              {{ userProfile.post_names || '未分配' }}
            </el-descriptions-item>
            <el-descriptions-item label="上次登录">
              {{ formatDate(userProfile.last_sign_in_at) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <div v-else class="error-container">
        <el-empty description="无法获取用户信息" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/system/auth'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()

const userProfile = computed(() => authStore.userProfile)
const userRoles = computed(() => authStore.userRoles)
const loading = computed(() => authStore.loading)

// 获取头像显示文本
const getAvatarText = () => {
  if (!userProfile.value) return ''
  if (userProfile.value.nickname) {
    return userProfile.value.nickname.substring(0, 1)
  }
  if (userProfile.value.email) {
    return userProfile.value.email.substring(0, 1).toUpperCase()
  }
  return '用'
}

// 格式化性别显示
const formatGender = (gender: number) => {
  switch (gender) {
    case 1: return '男'
    case 2: return '女'
    default: return '未知'
  }
}

// 格式化日期显示
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '从未登录'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// 加载用户信息
const loadUserProfile = async () => {
  if (!userProfile.value) {
    const result = await authStore.fetchUserProfile()
    if (!result.success) {
      ElMessage.error('获取用户信息失败')
    }
  }
}

onMounted(() => {
  loadUserProfile()
})
</script>

<style scoped>
.user-profile {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  color: #1A365D;
}

.loading-container {
  padding: 20px 0;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.avatar-section h3 {
  margin: 16px 0 8px;
  font-size: 18px;
  color: #1A365D;
}

.user-roles {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.role-tag {
  background-color: #F47B20;
  color: white;
  border: none;
}

.info-section {
  width: 100%;
}

.error-container {
  padding: 40px 0;
}
</style> 