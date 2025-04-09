<template>
  <div class="log-manage">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2>系统日志</h2>
        </div>
      </template>
      
      <el-form>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期时间"
            end-placeholder="结束日期时间"
            :shortcuts="dateRangeShortcuts"
            @change="handleDateChange"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="结果限制">
          <el-input-number v-model="logQuery.limit" :min="10" :max="100" step-strictly />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchLogs" :loading="loading">
            <el-icon><Search /></el-icon> 查询
          </el-button>
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
            prop="formatted_time"
            label="时间"
            min-width="170"
          >
            <template #default="scope">
              {{ formatTimestamp(scope.row.formatted_time || scope.row.timestamp) }}
            </template>
          </el-table-column>
          
          <el-table-column
            prop="request_method"
            label="请求方法"
            min-width="80"
          />
          
          <el-table-column
            prop="request_path"
            label="请求路径"
            min-width="250"
            show-overflow-tooltip
          />
          
          <el-table-column
            prop="response_status"
            label="响应状态"
            min-width="100"
          >
            <template #default="scope">
              <el-tag 
                :type="getStatusType(scope.row.response_status)" 
                size="small"
              >
                {{ scope.row.response_status }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column
            prop="supabase_auth"
            label="操作人ID"
            min-width="250"
            show-overflow-tooltip
          >
            <template #default="scope">
              <span v-if="scope.row.supabase_auth && Array.isArray(scope.row.supabase_auth) && scope.row.supabase_auth.length > 0 && scope.row.supabase_auth[0].auth_user">
                {{ scope.row.supabase_auth[0].auth_user }}
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-empty v-else-if="!loading && !error" description="暂无日志数据" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSystemLogs, LogType } from '@/services/system/logs'
import { useAuthStore } from '@/stores/system/auth'
import { 
  Search, Download
} from '@element-plus/icons-vue'
import { formatDateTime } from '@/utils/date'
import { getStatusType, getStatusDescription } from '@/utils/status'
import dayjs from 'dayjs'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)

const loading = ref(false)
const exporting = ref(false)
const error = ref<string | null>(null)
const logResults = ref<any[]>([])

// 日期范围
const dateRange = ref<[Date, Date] | null>(null)
const dateRangeShortcuts = [
  {
    text: '最近一分钟',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 60 * 1000) // 一分钟
      return [start, end]
    },
  },
  {
    text: '最近一小时',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000) // 一小时
      return [start, end]
    },
  },
  {
    text: '最近一天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24) // 一天
      return [start, end]
    },
  },
]

// 查询参数
const logQuery = ref({
  type: LogType.Edge,
  iso_timestamp_start: undefined as string | undefined,
  iso_timestamp_end: undefined as string | undefined,
  limit: 100
})

// 结果列（用于CSV导出）
const resultColumns = ref<string[]>(['formatted_time', 'request_method', 'request_path', 'response_status', 'supabase_auth'])

// 设置默认时间范围为最近半小时
const setDefaultTimeRange = () => {
  const end = new Date()
  const start = new Date()
  start.setTime(start.getTime() - 30 * 60 * 1000) // 半小时 (30分钟)
  
  dateRange.value = [start, end]
  logQuery.value.iso_timestamp_start = dayjs(start).format('YYYY-MM-DD HH:mm:ss')
  logQuery.value.iso_timestamp_end = dayjs(end).format('YYYY-MM-DD HH:mm:ss')
}

// 日期范围变更
const handleDateChange = (value: [Date, Date] | null) => {
  if (value) {
    // 直接使用北京时间，让Edge Function处理时区转换
    const formatToLocalString = (date: Date | string) => {
      return typeof date === 'string' ? date : dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    }
    
    logQuery.value.iso_timestamp_start = formatToLocalString(value[0])
    logQuery.value.iso_timestamp_end = formatToLocalString(value[1])
  } else {
    logQuery.value.iso_timestamp_start = undefined
    logQuery.value.iso_timestamp_end = undefined
  }
}

// 格式化时间戳
const formatTimestamp = (timestamp: string) => {
  if (!timestamp) return ''
  try {
    return formatDateTime(timestamp)
  } catch (e) {
    return timestamp
  }
}

// 获取日志
const fetchLogs = async () => {
  loading.value = true
  error.value = null
  
  try {
    const result = await getSystemLogs({
      type: logQuery.value.type,
      iso_timestamp_start: logQuery.value.iso_timestamp_start,
      iso_timestamp_end: logQuery.value.iso_timestamp_end,
      limit: logQuery.value.limit
    })
    
    if (result && result.success && Array.isArray(result.data)) {
      logResults.value = result.data
      
      if (result.meta) {
        // 格式化并显示查询元数据
        const formattedMeta = {
          查询类型: result.meta.query?.type || '边缘日志',
          时间范围: {
            开始: formatDateTime(result.meta.query?.timeRange?.startLocal),
            结束: formatDateTime(result.meta.query?.timeRange?.endLocal),
            持续时间: result.meta.query?.timeRange?.duration
          },
          结果数量: result.meta.count || 0,
          查询时间: formatDateTime(result.meta.timestampLocal)
        }
        console.log('日志查询元数据:', formattedMeta)
      }
    } else {
      logResults.value = []
      if (result && result.error) {
        throw new Error(result.error.message || '获取日志失败')
      } else {
        ElMessage.info('未查询到日志记录')
      }
    }
  } catch (err: any) {
    console.error('获取日志失败:', err)
    error.value = err.message || '获取日志失败'
    logResults.value = []
  } finally {
    loading.value = false
  }
}

// 重置查询
const resetQuery = () => {
  logQuery.value = {
    type: LogType.Edge,
    iso_timestamp_start: undefined,
    iso_timestamp_end: undefined,
    limit: 100
  }
  dateRange.value = null
  // 重置后设置默认时间范围
  setDefaultTimeRange()
}

// 导出日志到CSV
const exportLogs = () => {
  if (logResults.value.length === 0) {
    ElMessage.warning('没有可导出的数据')
    return
  }
  
  exporting.value = true
  
  try {
    // 获取标题行
    const headers = resultColumns.value.join(',')
    
    // 转换数据
    const rows = logResults.value.map(row => {
      return resultColumns.value.map(col => {
        const value = row[col]
        if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`
        }
        if (typeof value === 'string') {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    }).join('\n')
    
    const csvContent = `${headers}\n${rows}`
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    
    // 创建下载链接
    const link = document.createElement('a')
    const now = dayjs().format('YYYYMMDD_HHmmss')
    link.setAttribute('href', URL.createObjectURL(blob))
    link.setAttribute('download', `system_logs_${now}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success('日志导出成功')
  } catch (err: any) {
    ElMessage.error('导出失败: ' + (err.message || '未知错误'))
  } finally {
    exporting.value = false
  }
}

// 初始加载
onMounted(() => {
  // 设置默认时间范围
  setDefaultTimeRange()
  fetchLogs()
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

.error-message {
  margin: 15px 0;
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
</style> 