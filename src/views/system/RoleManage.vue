<template>
  <div class="role-manage">
    <div class="page-header">
      <h2>角色管理</h2>
      <el-button type="primary" size="small">
        <el-icon><Plus /></el-icon>新增角色
      </el-button>
    </div>
    
    <div class="role-table-container">
      <el-table :data="rolesList" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="description" label="角色描述" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" text>编辑</el-button>
            <el-button size="small" type="primary" text @click="showPermissions(scope.row)">权限</el-button>
            <el-button size="small" type="danger" text>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <el-dialog v-model="permissionsDialogVisible" title="角色权限" width="50%">
      <div class="permissions-container">
        <el-tree
          :data="permissionsData"
          show-checkbox
          node-key="id"
          :default-checked-keys="selectedPermissions"
          :props="{ label: 'name' }"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionsDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePermissions">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 模拟角色数据
const rolesList = ref([
  {
    id: 1,
    name: '系统管理员',
    description: '拥有系统所有操作权限',
    createdAt: '2024-03-15 10:00:00',
    updatedAt: '2024-03-15 10:00:00'
  },
  {
    id: 2,
    name: '安全主管',
    description: '负责安全管理相关工作',
    createdAt: '2024-03-15 10:05:00',
    updatedAt: '2024-03-15 10:05:00'
  },
  {
    id: 3,
    name: '普通用户',
    description: '只有基础查看权限',
    createdAt: '2024-03-15 10:10:00',
    updatedAt: '2024-03-15 10:10:00'
  }
])

// 权限配置相关
const permissionsDialogVisible = ref(false)
const currentRole = ref<any>(null)
const selectedPermissions = ref<number[]>([])

// 模拟权限数据
const permissionsData = ref([
  {
    id: 1,
    name: '仪表盘',
    children: [
      { id: 11, name: '查看仪表盘' }
    ]
  },
  {
    id: 2,
    name: '指标管理',
    children: [
      { id: 21, name: '查看指标' },
      { id: 22, name: '新增指标' },
      { id: 23, name: '编辑指标' },
      { id: 24, name: '删除指标' }
    ]
  },
  {
    id: 3,
    name: '事故管理',
    children: [
      { id: 31, name: '查看事故' },
      { id: 32, name: '新增事故' },
      { id: 33, name: '编辑事故' },
      { id: 34, name: '删除事故' }
    ]
  },
  {
    id: 4,
    name: '系统管理',
    children: [
      { id: 41, name: '用户管理' },
      { id: 42, name: '角色管理' },
      { id: 43, name: '系统设置' }
    ]
  }
])

// 显示权限对话框
const showPermissions = (role: any) => {
  currentRole.value = role
  permissionsDialogVisible.value = true
  
  // 模拟已选权限
  if (role.id === 1) { // 管理员拥有所有权限
    selectedPermissions.value = [11, 21, 22, 23, 24, 31, 32, 33, 34, 41, 42, 43]
  } else if (role.id === 2) { // 安全主管
    selectedPermissions.value = [11, 21, 22, 23, 31, 32, 33]
  } else { // 普通用户
    selectedPermissions.value = [11, 21, 31]
  }
}

// 保存权限
const savePermissions = () => {
  // 这里添加保存权限的逻辑
  permissionsDialogVisible.value = false
  
  // 显示保存成功消息
  ElMessage({
    message: '权限设置保存成功',
    type: 'success'
  })
}
</script>

<style scoped lang="scss">
.role-manage {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      margin: 0;
      font-size: 18px;
      color: #1A365D;
    }
  }
  
  .role-table-container {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .permissions-container {
    height: 400px;
    overflow-y: auto;
    padding: 10px;
    border: 1px solid #E2E8F0;
    border-radius: 4px;
  }
}
</style> 