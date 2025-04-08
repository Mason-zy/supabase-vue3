<template>
  <div class="log-manage">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2>系统日志</h2>
          <div class="operation-group">
            <el-select v-model="selectedTemplate" placeholder="选择日志类型" @change="handleTemplateChange">
              <el-option
                v-for="(template, key) in templates"
                :key="key"
                :label="template.title"
                :value="key"
              />
            </el-select>
            <el-button type="primary" @click="fetchLogs" :loading="loading">
              <el-icon><Search /></el-icon> 查询
            </el-button>
          </div>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" class="tabs">
        <el-tab-pane label="日志查询" name="query">
          <el-form>
            <el-form-item label="日志类型">
              <el-select v-model="logQuery.logType" placeholder="请选择日志类型" style="width: 100%">
                <el-option label="API请求日志" value="edge_logs" />
                <el-option label="认证日志" value="auth_logs" />
                <el-option label="数据库日志" value="postgres_logs" />
                <el-option label="存储日志" value="storage_logs" />
                <el-option label="实时日志" value="realtime_logs" />
                <el-option label="函数日志" value="function_logs" />
              </el-select>
            </el-form-item>
            <el-form-item label="结果限制">
              <el-input-number v-model="logQuery.limit" :min="10" :max="1000" step-strictly />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="fetchLogs" :loading="loading">查询</el-button>
              <el-button @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
          
          <div v-if="error" class="error-message">
            <el-alert
              :title="error"
              type="error"
              show-icon
              :closable="false"
            />
          </div>
          
          <div v-if="logResults.length > 0" class="log-results">
            <div class="result-header">
              <span>查询结果 ({{ logResults.length }} 条记录)</span>
              <el-button size="small" @click="exportLogs">
                <el-icon><Download /></el-icon> 导出CSV
              </el-button>
            </div>
            
            <el-table 
              :data="logResults"
              style="width: 100%"
              stripe
              border
              height="500"
              :max-height="600"
              v-loading="loading"
            >
              <el-table-column
                v-for="(column, index) in resultColumns"
                :key="index"
                :prop="column"
                :label="formatColumnLabel(column)"
                :min-width="column === 'event_message' ? 400 : 150"
                show-overflow-tooltip
              >
                <template #default="scope">
                  <div v-if="column === 'status_code' || column === 'res.status_code'">
                    <el-tag 
                      :type="getStatusType(scope.row[column])" 
                      size="small"
                    >
                      {{ scope.row[column] }}
                    </el-tag>
                  </div>
                  <div v-else-if="typeof scope.row[column] === 'object'">
                    {{ JSON.stringify(scope.row[column]) }}
                  </div>
                  <div v-else>
                    {{ scope.row[column] }}
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-empty v-else-if="!loading && !error" description="暂无日志数据" />
        </el-tab-pane>
        
        <el-tab-pane label="常用查询" name="templates">
          <el-card v-for="(template, key) in templates" :key="key" class="template-card">
            <template #header>
              <div class="template-header">
                <span>{{ template.title }}</span>
                <el-button-group>
                  <el-button size="small" @click="loadTemplate(String(key))">
                    <el-icon><DocumentCopy /></el-icon> 使用
                  </el-button>
                </el-button-group>
              </div>
            </template>
            <div class="template-content">
              <p><strong>日志类型:</strong> {{ getLogTypeLabel(template.logType) }}</p>
              <pre class="query-code">{{ template.query }}</pre>
            </div>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { logService } from '@/services/supabase/logs'
import { useAuthStore } from '@/stores/system/auth'
import { 
  Search, Refresh, Download, DocumentCopy
} from '@element-plus/icons-vue'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)

const loading = ref(false)
const error = ref<string | null>(null)
const logResults = ref<any[]>([])
const activeTab = ref('query')
const templates = ref(logService.getQueryTemplates())
const selectedTemplate = ref('')

// 查询参数
const logQuery = ref({
  logType: 'auth_logs',
  query: '',
  limit: 100
})

// 结果列
const resultColumns = ref<string[]>([])

// 获取日志
const fetchLogs = async () => {
  loading.value = true
  error.value = null
  
  try {
    const result = await logService.getLogs(logQuery.value)
    
    if (Array.isArray(result) && result.length > 0) {
      logResults.value = result
      // 提取结果列
      resultColumns.value = Object.keys(result[0])
    } else {
      logResults.value = []
      resultColumns.value = []
      ElMessage.info('未查询到日志记录')
    }
  } catch (err: any) {
    console.error('获取日志失败:', err)
    error.value = err.message || '获取日志失败'
    logResults.value = []
    resultColumns.value = []
  } finally {
    loading.value = false
  }
}

// 重置查询
const resetQuery = () => {
  logQuery.value = {
    logType: 'auth_logs',
    query: '',
    limit: 100
  }
  selectedTemplate.value = ''
}

// 加载模板
const loadTemplate = (key: string) => {
  const template = templates.value[key as keyof typeof templates.value]
  if (template) {
    logQuery.value.logType = template.logType
    logQuery.value.query = template.query || ''
    activeTab.value = 'query'
  }
}

// 模板变更处理
const handleTemplateChange = (value: string) => {
  if (value) {
    loadTemplate(value)
  }
}

// 格式化列标签
const formatColumnLabel = (column: string) => {
  return column.replace(/[._]/g, ' ').replace(/(^|\s)\S/g, s => s.toUpperCase())
}

// 获取日志类型标签
const getLogTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    'edge_logs': 'API请求日志',
    'auth_logs': '认证日志',
    'postgres_logs': '数据库日志',
    'storage_logs': '存储日志',
    'realtime_logs': '实时日志',
    'function_logs': '函数日志'
  }
  return map[type] || type
}

// 获取状态码类型
const getStatusType = (code: number | string) => {
  if (!code) return ''
  const statusCode = typeof code === 'string' ? parseInt(code) : code
  if (statusCode < 300) return 'success'
  if (statusCode < 400) return 'info'
  if (statusCode < 500) return 'warning'
  return 'danger'
}

// 导出日志到CSV
const exportLogs = () => {
  if (logResults.value.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  
  // 构建CSV内容
  const headers = resultColumns.value.join(',')
  const rows = logResults.value.map(row => {
    return resultColumns.value.map(col => {
      const value = row[col]
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`
      }
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value || ''
    }).join(',')
  }).join('\n')
  
  const csvContent = `${headers}\n${rows}`
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.setAttribute('href', url)
  link.setAttribute('download', `logs_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 页面加载时初始化
onMounted(() => {
  // 初始化页面，这里可以添加其他初始化操作
})
</script>

<style scoped>
.log-manage {
  min-height: 80vh;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.operation-group {
  display: flex;
  gap: 10px;
}

.tabs {
  margin-top: 20px;
}

.log-results {
  margin-top: 20px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.template-card {
  margin-bottom: 20px;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-content {
  font-size: 14px;
}

.query-code {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  word-break: break-all;
  color: #606266;
  font-size: 12px;
  margin-top: 10px;
}

.tips {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

.tips code {
  background-color: #f5f7fa;
  padding: 2px 5px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.error-message {
  margin: 20px 0;
}
</style> 