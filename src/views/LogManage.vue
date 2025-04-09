<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { FormInstance } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getSystemLogs, LogType, getQueryTemplates } from '@/services/system/logs';
import { formatDateTime } from '@/utils/date';
import dayjs from 'dayjs';

const logTypeOptions = [
  { value: 'edge', label: 'API/边缘日志' },
  { value: 'function_edge', label: '边缘函数日志' },
  { value: 'function', label: '函数执行日志' },
  { value: 'auth', label: '认证日志' },
  { value: 'postgres', label: '数据库日志' },
  { value: 'storage', label: '存储日志' }
];

// 日志查询参数
const logQuery = reactive({
  type: 'edge', // 默认查询API日志
  searchTerm: '',
  dateRange: null as [Date, Date] | null,
  limit: 100, // 默认100条
});

// 日志数据
const logData = ref<any[]>([]);
const loading = ref(false);
const templates = getQueryTemplates();

// 处理日期范围变化
const handleDateChange = (val: [Date, Date] | null) => {
  if (val && val.length === 2) {
    // 转换为ISO格式，使用北京时间
    const start = dayjs(val[0]).format('YYYY-MM-DDTHH:mm:ss');
    const end = dayjs(val[1]).format('YYYY-MM-DDTHH:mm:ss');
    logQuery.dateRange = val;
  } else {
    logQuery.dateRange = null;
  }
};

// 获取日志
const fetchLogs = async () => {
  loading.value = true;
  try {
    // 构建查询参数
    const params: any = {
      type: logQuery.type,
      limit: logQuery.limit
    };

    // 添加时间范围参数
    if (logQuery.dateRange && logQuery.dateRange.length === 2) {
      params.iso_timestamp_start = dayjs(logQuery.dateRange[0]).format('YYYY-MM-DDTHH:mm:ss');
      params.iso_timestamp_end = dayjs(logQuery.dateRange[1]).format('YYYY-MM-DDTHH:mm:ss');
    }

    // 添加搜索词
    if (logQuery.searchTerm) {
      params.searchTerm = logQuery.searchTerm;
    }

    // 调用日志服务
    const data = await getSystemLogs(params);
    logData.value = data?.logs || [];
    
    if (logData.value.length === 0) {
      ElMessage.info('未查询到匹配的日志数据');
    }
  } catch (error: any) {
    console.error('获取日志失败:', error);
    ElMessage.error(`获取日志失败: ${error.message || '未知错误'}`);
  } finally {
    loading.value = false;
  }
};

// 重置查询条件
const resetQuery = () => {
  logQuery.type = 'edge';
  logQuery.searchTerm = '';
  logQuery.dateRange = null;
  logQuery.limit = 100;
};

// 加载模板
const loadTemplate = (key: string) => {
  const template = templates[key];
  if (template) {
    logQuery.type = template.logType;
    logQuery.dateRange = null; // 使用默认时间范围
    fetchLogs();
  }
};

// 格式化日志时间
const formatLogTime = (isoTime: string) => {
  return formatDateTime(isoTime);
};

// 初始化
onMounted(() => {
  fetchLogs();
});
</script> 