import { supabase } from '../supabase/client';

// 定义日志类型枚举
export enum LogType {
  Auth = 'auth',
  Edge = 'edge',
  FunctionEdge = 'function_edge',
  Function = 'function',
  Postgres = 'postgres',
  Postgrest = 'postgrest',
  Realtime = 'realtime',
  Storage = 'storage'
}

// 日志查询参数接口
export interface LogQueryParams {
  type?: LogType | string;
  iso_timestamp_start?: string;
  iso_timestamp_end?: string;
  limit?: number;
  searchTerm?: string;
}

/**
 * 获取系统日志
 * @param params 查询参数
 * @returns 日志数据
 * 
 * 注意：
 * 1. 默认查询最近24小时的日志
 * 2. 时间范围最大为24小时
 * 3. 可以直接使用北京时间，无需转换为UTC
 * 4. 使用ISO时间格式，如：2025-04-09T12:00:00（北京时间）
 */
export async function getSystemLogs(params: LogQueryParams = {}) {
  try {
    // 调用Edge Function
    const { data, error } = await supabase.functions.invoke('system-logs', {
      body: params
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('获取系统日志失败:', error);
    throw error;
  }
}

/**
 * 获取查询模板
 * 提供常用的日志查询模板
 * @returns 日志查询模板
 */
export function getQueryTemplates() {
  return {
    'api_logs': {
      title: 'API请求日志',
      logType: 'edge',
      description: '查询最近24小时的API请求日志'
    },
    'function_edge_logs': {
      title: '边缘函数日志',
      logType: 'function_edge',
      description: '查询最近24小时的边缘函数调用日志'
    },
    'function_logs': {
      title: '函数执行日志',
      logType: 'function',
      description: '查询最近24小时的函数执行日志'
    },
    'recent_auth': {
      title: '最近认证日志',
      logType: 'auth',
      description: '查询最近24小时的用户认证活动'
    },
    'recent_errors': {
      title: '最近错误日志',
      logType: 'edge',
      description: '查询最近24小时的错误日志(400/500等状态码)'
    }
  };
} 