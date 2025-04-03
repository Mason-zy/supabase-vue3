<template>
  <div class="department-manage">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2>部门管理</h2>
          <div class="operation-group">
            <el-input
              v-model="searchKeyword"
              placeholder="输入关键字搜索"
              clearable
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="handleAdd(null)">
              <el-icon><Plus /></el-icon> 新增部门
            </el-button>
          </div>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="tree-container">
            <div class="tree-header">
              <span class="tree-title">部门结构</span>
              <el-tooltip content="刷新数据" placement="top">
                <el-button text @click="loadDepartments">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
            <el-tree
              ref="deptTree"
              :data="treeData"
              :props="defaultProps"
              :filter-node-method="filterNode"
              node-key="dept_id"
              default-expand-all
              highlight-current
              @node-click="handleNodeClick"
            >
              <template #default="{ node, data }">
                <div class="custom-tree-node">
                  <div class="node-label">
                    <el-icon>
                      <component :is="node.isLeaf ? 'OfficeBuilding' : 'FolderOpened'" />
                    </el-icon>
                    <span class="label-text">{{ node.label }}</span>
                    <el-tag v-if="data.status === 0" size="small" type="danger">已停用</el-tag>
                  </div>
                  <div class="node-actions">
                    <el-dropdown trigger="click" @command="handleDropdownCommand($event, node, data)">
                      <el-button link>
                        <el-icon><More /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="add">新增子部门</el-dropdown-item>
                          <el-dropdown-item command="edit">修改部门</el-dropdown-item>
                          <el-dropdown-item command="delete" divided>删除部门</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </div>
          </template>
            </el-tree>
          </div>
        </el-col>
        <el-col :span="16">
          <el-tabs v-model="activeTab" class="detail-tabs">
            <el-tab-pane label="基本信息" name="basic">
              <div v-if="currentDept" class="dept-info">
                <el-descriptions title="部门详情" :column="2" border>
                  <el-descriptions-item label="部门名称">{{ currentDept.dept_name }}</el-descriptions-item>
                  <el-descriptions-item label="部门编码">{{ currentDept.dept_code }}</el-descriptions-item>
                  <el-descriptions-item label="上级部门">
                    {{ getParentDeptName(currentDept.parent_id) || '无' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="显示排序">{{ currentDept.order_num }}</el-descriptions-item>
                  <el-descriptions-item label="负责人">{{ currentDept.leader || '未指定' }}</el-descriptions-item>
                  <el-descriptions-item label="联系电话">{{ currentDept.phone || '未设置' }}</el-descriptions-item>
                  <el-descriptions-item label="邮箱">{{ currentDept.email || '未设置' }}</el-descriptions-item>
                  <el-descriptions-item label="状态">
                    <el-tag :type="currentDept.status === 1 ? 'success' : 'danger'">
                      {{ currentDept.status === 1 ? '正常' : '停用' }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="创建时间" :span="2">
                    {{ formatDate(currentDept.create_time) }}
                  </el-descriptions-item>
                </el-descriptions>
                <div class="action-bar">
                  <el-button type="primary" @click="handleEdit(currentDept)">
                    <el-icon><Edit /></el-icon> 修改
                  </el-button>
                  <el-button type="danger" @click="handleDelete(null, currentDept)">
                    <el-icon><Delete /></el-icon> 删除
                  </el-button>
                </div>
      </div>
              <el-empty v-else description="请选择部门" />
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </el-card>

    <!-- 部门表单对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="formTitle" 
      width="500px"
      append-to-body
      destroy-on-close
    >
      <el-form
        ref="deptForm"
        :model="formData"
        :rules="rules"
        label-width="100px"
        status-icon
      >
        <el-form-item label="上级部门">
          <el-tree-select
            v-model="formData.parent_id"
            :data="treeData"
            :props="defaultProps"
            check-strictly
            default-expand-all
            placeholder="请选择上级部门"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="部门名称" prop="dept_name">
          <el-input v-model="formData.dept_name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="部门编码" prop="dept_code">
          <el-input v-model="formData.dept_code" placeholder="请输入部门编码" />
        </el-form-item>
        <el-form-item label="显示排序" prop="order_num">
          <el-input-number v-model="formData.order_num" :min="0" :max="999" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="部门状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelForm">取 消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { departmentService } from '@/services/system/departments'
import type { Database } from '@/types/database'
import { 
  Plus, Edit, Delete, Refresh, Search, 
  More, OfficeBuilding, FolderOpened
} from '@element-plus/icons-vue'

// 定义命令类型
type CommandType = 'add' | 'edit' | 'delete'

// 定义树节点接口
interface TreeNodeData {
  label: string;
  isLeaf?: boolean;
  childNodes?: TreeNodeData[];
  [key: string]: any;
}

type BaseDepartment = Database['public']['Tables']['departments']['Row']
interface Department extends BaseDepartment {
  children?: Department[]
}

const deptTree = ref()
const searchKeyword = ref('')
const currentDept = ref<Department | null>(null)
const treeData = ref<Department[]>([])
const dialogVisible = ref(false)
const submitLoading = ref(false)
const activeTab = ref('basic')

const formTitle = computed(() => {
  return currentDept.value?.dept_id ? '编辑部门' : '新增部门'
})

const defaultProps = {
  children: 'children',
  label: 'dept_name',
  value: 'dept_id'
}

const formData = ref<Partial<Department>>({
  parent_id: null,
  dept_name: '',
  dept_code: '',
  leader: null,
  phone: '',
  email: '',
  order_num: 0,
  status: 1
})

const rules: FormRules = {
  dept_name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  dept_code: [
    { required: true, message: '请输入部门编码', trigger: 'blur' },
    { pattern: /^[A-Z0-9]+$/, message: '部门编码只能包含大写字母和数字', trigger: 'blur' }
  ],
  order_num: [
    { required: true, message: '请输入显示排序', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$|^0\d{2,3}-\d{7,8}$/, message: '请输入正确的电话号码', trigger: 'blur' }
  ]
}

const deptForm = ref<FormInstance>()

// 监听搜索关键字变化
watch(searchKeyword, (val) => {
  deptTree.value?.filter(val)
})

// 过滤节点
const filterNode = (value: string, data: Department) => {
  if (!value) return true
  return data.dept_name.includes(value) || (data.dept_code && data.dept_code.includes(value))
}

// 获取上级部门名称
const getParentDeptName = (parentId: number | null) => {
  if (!parentId) return ''
  const findParent = (departments: Department[]): string => {
    for (const dept of departments) {
      if (dept.dept_id === parentId) {
        return dept.dept_name
      }
      if (dept.children && dept.children.length > 0) {
        const result = findParent(dept.children)
        if (result) return result
      }
    }
    return ''
  }
  return findParent(treeData.value)
}

// 格式化日期
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '未知'
  const date = new Date(dateStr)
  return date.toLocaleString()
}

// 加载部门数据
const loadDepartments = async () => {
  try {
    const departments = await departmentService.getDepartments()
    treeData.value = buildTree(departments)
  } catch (error) {
    console.error('加载部门数据失败:', error)
    ElMessage.error('加载部门数据失败')
  }
}

// 构建树形结构
const buildTree = (departments: Department[]) => {
  const map = new Map<number, Department>()
  const tree: Department[] = []

  // 首先复制所有部门，准备构建树
  departments.forEach(dept => {
    // 使用深拷贝避免引用问题
    map.set(dept.dept_id, { ...dept, children: [] })
  })

  // 然后构建父子关系
  departments.forEach(dept => {
    const node = map.get(dept.dept_id)
    if (!node) return // 安全检查
    
    if (dept.parent_id === null) {
      // 根节点直接添加到树中
      tree.push(node)
    } else {
      // 子节点添加到父节点的children中
      const parent = map.get(dept.parent_id)
      if (parent) {
        // 确保parent.children已初始化
        if (!parent.children) {
          parent.children = []
        }
        // 将节点添加到父节点的子节点数组中
        parent.children.push(node)
      } else {
        // 如果找不到父节点，作为顶级节点处理
        tree.push(node)
      }
    }
  })

  return tree
}

// 处理下拉菜单命令的中转函数，解决类型问题
const handleDropdownCommand = (command: string, node: any, data: Department) => {
  // 强制转换类型
  handleCommand(command as CommandType, node as TreeNodeData, data)
}

// 处理下拉菜单命令
const handleCommand = (command: CommandType, node: TreeNodeData, data: Department) => {
  switch (command) {
    case 'add':
      handleAdd(data)
      break
    case 'edit':
      handleEdit(data)
      break
    case 'delete':
      handleDelete(node, data)
      break
  }
}

// 处理节点点击
const handleNodeClick = (data: Department) => {
  currentDept.value = data
}

// 处理添加部门
const handleAdd = (data: Department | null) => {
  // 重置表单数据
  formData.value = {
    parent_id: data?.dept_id || null,
    dept_name: '',
    dept_code: '',
    leader: null,
    phone: '',
    email: '',
    order_num: 0,
    status: 1
  }
  
  // 清除当前选中的部门，避免与新增混淆
  if (!data) {
    currentDept.value = null
  }
  
  dialogVisible.value = true
}

// 处理编辑部门
const handleEdit = (data: Department) => {
  formData.value = { ...data }
  dialogVisible.value = true
}

// 取消表单
const cancelForm = () => {
  dialogVisible.value = false
  deptForm.value?.resetFields()
}

// 处理删除部门
const handleDelete = async (node: TreeNodeData | null, data: Department) => {
  if (node && node.childNodes && node.childNodes.length > 0) {
    ElMessage.warning('该部门下还有子部门，不能删除')
    return
  }
  
  // 确认子部门情况
  const children = data.children || []
  if (children.length > 0) {
    ElMessage.warning('该部门下还有子部门，不能删除')
    return
  }

  try {
    await ElMessageBox.confirm('确认要删除该部门吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    await departmentService.deleteDepartment(data.dept_id)
    ElMessage.success('删除成功')
    
    // 刷新数据
    await loadDepartments()
    
    // 清除当前选中
    if (currentDept.value?.dept_id === data.dept_id) {
      currentDept.value = null
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除部门失败:', error)
      ElMessage.error('删除部门失败')
    }
  }
}

// 提交表单
const submitForm = async () => {
  if (!deptForm.value) return
  
  await deptForm.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        // 创建要提交的数据对象，移除children和dept_id字段
        const submitData = { ...formData.value }
        delete submitData.children
        delete submitData.dept_id  // 移除dept_id字段，它是自动生成的
        
        let updatedDeptId: number
        
        if (currentDept.value?.dept_id) {
          // 更新现有部门
          updatedDeptId = currentDept.value.dept_id
          await departmentService.updateDepartment(
            updatedDeptId,
            submitData
          )
          ElMessage.success('更新成功')
        } else {
          // 添加新部门，确保parent_id正确传递
          const result = await departmentService.addDepartment(submitData as Omit<Department, 'dept_id'>)
          updatedDeptId = result.dept_id
          ElMessage.success('添加成功')
        }
        
        dialogVisible.value = false
        
        // 重新加载部门数据
        await loadDepartments()
        
        // 更新当前选中的部门详情
        if (updatedDeptId) {
          // 从刷新后的树数据中查找更新后的部门
          const findUpdatedDept = (departments: Department[]): Department | null => {
            for (const dept of departments) {
              if (dept.dept_id === updatedDeptId) {
                return dept
              }
              if (dept.children && dept.children.length > 0) {
                const found = findUpdatedDept(dept.children)
                if (found) return found
              }
            }
            return null
          }
          
          const updatedDept = findUpdatedDept(treeData.value)
          if (updatedDept) {
            currentDept.value = updatedDept
            // 高亮显示当前节点
            deptTree.value?.setCurrentKey(updatedDeptId)
          }
        }
      } catch (error) {
        console.error('保存部门失败:', error)
        ElMessage.error('保存部门失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

onMounted(() => {
  loadDepartments()
})
</script>

<style scoped>
.department-manage {
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

.operation-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  width: 220px;
}

.tree-container {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fff;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #f5f7fa;
}

.tree-title {
  font-weight: bold;
  color: #1A365D;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  width: 100%;
}

.node-label {
  display: flex;
  align-items: center;
  gap: 5px;
}

.label-text {
  margin-left: 5px;
}

.node-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.custom-tree-node:hover .node-actions {
  opacity: 1;
}

.detail-tabs {
  margin-top: 0;
  height: 100%;
}

.dept-info {
  padding: 20px 0;
}

.action-bar {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style> 