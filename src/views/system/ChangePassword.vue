<template>
  <div class="change-password">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2>修改密码</h2>
        </div>
      </template>

      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else class="form-container">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          @submit.prevent="handleSubmit"
        >
          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="form.newPassword"
              type="password"
              placeholder="请输入新密码"
              show-password
            />
            <div class="password-tip">密码长度不少于8位，包含字母和数字</div>
          </el-form-item>

          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password
            />
          </el-form-item>

          <div class="form-actions">
            <el-button
              type="primary"
              native-type="submit"
              :loading="loading"
              :disabled="loading"
            >
              确认修改
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </div>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/system/auth'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

// 表单数据
const form = reactive({
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const rules = reactive<FormRules>({
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8个字符', trigger: 'blur' },
    { 
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, 
      message: '密码必须包含字母和数字', 
      trigger: 'blur' 
    }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { 
      validator: (_, value, callback) => {
        if (value !== form.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
})

// 处理表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid, fields) => {
    if (!valid) {
      console.log('表单验证失败', fields)
      return
    }
    
    loading.value = true
    
    try {
      const result = await authStore.updatePassword(form.newPassword)
      
      if (result.success) {
        ElMessage.success('密码修改成功')
        resetForm()
      } else {
        ElMessage.error(result.error || '密码修改失败')
      }
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      loading.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}
</script>

<style scoped>
.change-password {
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

.form-container {
  padding: 10px 0;
}

.password-tip {
  font-size: 12px;
  color: #A0AEC0;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-start;
  gap: 16px;
  margin-top: 24px;
}
</style> 