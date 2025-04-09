// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// import "jsr:@supabase/functions-js/edge-runtime.d.ts"
// @ts-ignore - 由于模块引入问题，我们忽略此错误但保留功能
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import dayjs from 'https://cdn.skypack.dev/dayjs@1.11.10'
import utc from 'https://cdn.skypack.dev/dayjs@1.11.10/plugin/utc'
import timezone from 'https://cdn.skypack.dev/dayjs@1.11.10/plugin/timezone'

// 初始化 dayjs 插件
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Shanghai')

console.log("Hello from Functions!")

// 定义日志类型枚举和对应的表名
export enum LogTable {
  Auth = 'auth_logs',
  Edge = 'edge_logs',
  FunctionEdge = 'function_edge_logs',
  Function = 'function_logs',
  PgBouncer = 'pgbouncer_logs',
  Postgres = 'postgres_logs',
  Postgrest = 'postgrest_logs',
  Realtime = 'realtime_logs',
  Storage = 'storage_logs',
  Supervisor = 'supervisor_logs'
}

// 定义 Supabase Logs API 请求参数接口
interface LogsQueryParams {
  type?: string;
  iso_timestamp_start?: string;
  iso_timestamp_end?: string;
  limit?: string;
}

// Hardcoded credentials
const SUPABASE_PROJECT_ID = "zhbfoqkfuqcruvqmlxnx"
const SUPABASE_ACCESS_TOKEN = "sbp_e6739cd03fb5afacd2f4703de196ec1b32e6a90b"

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}

serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 从请求中获取参数 (支持 JSON 和 URL 查询字符串)
    let params: LogsQueryParams = {};
    
    if (req.method === 'POST') {
      // 尝试从请求体解析 JSON
      params = await req.json().catch(() => ({}));
    }
    
    // 如果没有从请求体获取到参数，尝试从 URL 查询字符串获取
    if (Object.keys(params).length === 0) {
      const url = new URL(req.url);
      params = {
        type: url.searchParams.get('type') || undefined,
        iso_timestamp_start: url.searchParams.get('iso_timestamp_start') || undefined,
        iso_timestamp_end: url.searchParams.get('iso_timestamp_end') || undefined,
        limit: url.searchParams.get('limit') || undefined
      };
    }
    

    // 参数提取
    const { type, iso_timestamp_start, iso_timestamp_end, limit } = params;
    
    // 解析limit参数，默认为20，最大为100
    const parsedLimit = limit ? Math.min(parseInt(limit) || 20, 100) : 20;
    
    // 确定日志表名称
    let logTable = '';
    
    // 时区处理：使用 dayjs 进行时间转换
    // 转换北京时间为UTC
    const convertToUTC = (timeStr: string | undefined): string | undefined => {
      if (!timeStr) return undefined;
      try {
        return dayjs.tz(timeStr, 'Asia/Shanghai').utc().format();
      } catch (e) {
        console.error('时间转换错误:', e);
        return undefined;
      }
    };
    
    // 当前时间
    const now = dayjs().utc();
    const nowIso = now.format();
    
    // 时间参数处理
    let startTime: string;
    let endTime: string;
    
    // 确定日志表名称
    switch(type ? type.toLowerCase() : 'edge') {
      case 'auth':
      case 'authentication': 
        logTable = LogTable.Auth; 
        break;
      case 'api': 
      case 'edge': 
        logTable = LogTable.Edge; 
        break;
      case 'function_edge': 
      case 'functionedge': 
        logTable = LogTable.FunctionEdge; 
        break;
      case 'function': 
        logTable = LogTable.Function; 
        break;
      case 'pgbouncer': 
      case 'pg_bouncer': 
        logTable = LogTable.PgBouncer; 
        break;
      case 'postgres': 
      case 'database': 
      case 'db': 
        logTable = LogTable.Postgres; 
        break;
      case 'postgrest': 
      case 'rest': 
        logTable = LogTable.Postgrest; 
        break;
      case 'realtime': 
      case 'rt': 
        logTable = LogTable.Realtime; 
        break;
      case 'storage': 
        logTable = LogTable.Storage; 
        break;
      case 'supervisor':
        logTable = LogTable.Supervisor;
        break;
      default: 
        logTable = LogTable.Edge; // 默认使用边缘日志
    }
    
    // 设置时间范围处理逻辑
    if (iso_timestamp_start && iso_timestamp_end) {
      // 用户同时指定了开始和结束时间
      startTime = convertToUTC(iso_timestamp_start) || now.subtract(24, 'hour').format();
      endTime = convertToUTC(iso_timestamp_end) || nowIso;
      
      // 检查时间范围是否超过24小时
      const diffHours = dayjs(endTime).diff(dayjs(startTime), 'hour');
      if (diffHours > 24) {
        // 时间范围超过24小时，限制为24小时
        startTime = dayjs(endTime).subtract(24, 'hour').format();
        console.log('时间范围超过24小时，已限制为最大24小时');
      }
    } else if (iso_timestamp_start && !iso_timestamp_end) {
      // 只提供了开始时间，结束时间为当前时间
      startTime = convertToUTC(iso_timestamp_start) || now.subtract(24, 'hour').format();
      endTime = nowIso;
      
      // 检查时间范围是否超过24小时
      const diffHours = dayjs(endTime).diff(dayjs(startTime), 'hour');
      if (diffHours > 24) {
        // 时间范围超过24小时，限制为24小时
        startTime = dayjs(endTime).subtract(24, 'hour').format();
        console.log('时间范围超过24小时，已限制为最大24小时');
      }
    } else if (!iso_timestamp_start && iso_timestamp_end) {
      // 只提供了结束时间，开始时间设为24小时前
      endTime = convertToUTC(iso_timestamp_end) || nowIso;
      startTime = dayjs(endTime).subtract(24, 'hour').format();
    } else {
      // 没有提供时间范围，设置默认值
      if (type) {
        // 如果指定了类型，默认查询最近10分钟
        endTime = nowIso;
        startTime = now.subtract(10, 'minute').format();
        console.log('指定了日志类型但未提供时间范围，默认查询最近10分钟');
      } else {
        // 默认查询最近24小时
        endTime = nowIso;
        startTime = now.subtract(24, 'hour').format();
        console.log('未提供时间范围，默认查询最近24小时');
      }
    }
    
    // 计算查询的时间段描述
    const describeDuration = () => {
      const diffHours = dayjs(endTime).diff(dayjs(startTime), 'hour');
      const diffMinutes = dayjs(endTime).diff(dayjs(startTime), 'minute') % 60;
      
      if (diffHours >= 1) {
        return diffMinutes > 0 
          ? `${diffHours}小时${diffMinutes}分钟` 
          : `${diffHours}小时`;
      } else {
        return `${diffMinutes}分钟`;
      }
    };
    
    // 根据日志表生成对应的SQL查询
    let sql = '';
    
    // 转换时间戳为可读格式（中国时区）
    const timestampSelect = 'datetime(timestamp, "Asia/Shanghai") as formatted_time';
    
    switch(logTable) {
      case LogTable.Edge:
        sql = `
          SELECT 
            ${timestampSelect},
            id,
            event_message,
            r.method as request_method,
            r.path as request_path,
            r.host as request_host,
            rs.status_code as response_status,
            h.x_real_ip as client_ip,
            h.user_agent as user_agent,
            r.sb as supabase_auth
          FROM ${logTable}
          CROSS JOIN UNNEST(metadata) as m
          CROSS JOIN UNNEST(m.request) as r
          CROSS JOIN UNNEST(m.response) as rs
          CROSS JOIN UNNEST(r.headers) as h
          WHERE r.method != 'OPTIONS'
            AND r.path NOT LIKE '/auth/v1/health%'
            AND r.path NOT LIKE '/rest-admin/v1/live%'
          ORDER BY timestamp DESC
          LIMIT ${parsedLimit}
        `;
        break;
      
      case LogTable.Auth:
        sql = `
          SELECT 
            ${timestampSelect},
            id,
            event_message
          FROM ${logTable}
          ORDER BY timestamp DESC
          LIMIT ${parsedLimit}
        `;
        break;
      
      case LogTable.Function:
      case LogTable.FunctionEdge:
        sql = `
          SELECT 
            ${timestampSelect},
            id,
            event_message,
            m.function_id,
            m.execution_time_ms,
            m.deployment_id
          FROM ${logTable}
          CROSS JOIN UNNEST(metadata) as m
          ORDER BY timestamp DESC
          LIMIT ${parsedLimit}
        `;
        break;
      
      case LogTable.Postgres:
        sql = `
          SELECT 
            ${timestampSelect},
            id,
            event_message
          FROM ${logTable}
          ORDER BY timestamp DESC
          LIMIT ${parsedLimit}
        `;
        break;
        
      default:
        // 默认的查询，适用于其他所有日志表
        sql = `
          SELECT 
            ${timestampSelect},
            id,
            event_message
          FROM ${logTable}
          ORDER BY timestamp DESC
          LIMIT ${parsedLimit}
        `;
    }

    console.log('生成的SQL查询:', sql);
    
    // 构建API URL (使用 URLSearchParams 确保正确编码)
    const queryParams = new URLSearchParams();
    queryParams.append('iso_timestamp_start', startTime);
    queryParams.append('iso_timestamp_end', endTime);
    queryParams.append('sql', sql);
    
    const apiUrl = `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_ID}/analytics/endpoints/logs.all?${queryParams.toString()}`;
    
    console.log('请求URL:', apiUrl);
    
    // 转换为中国时区的本地时间
    const formatLocalTime = (isoString: string) => {
      if (!isoString) return null;
      try {
        return dayjs(isoString).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
      } catch (e) {
        return null;
      }
    };
    
    // 发送请求到 Management API
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    // 获取响应状态和内容
    const status = response.status;
    const apiData = await response.json();
    
    // 处理API响应数据
    let result = [];
    let errorMessage = '';
    let success = false;
    
    if (status === 200 && apiData && apiData.result) {
      // 成功获取数据
      result = apiData.result;
      success = true;
    } else if (status === 200 && (!apiData || !apiData.result)) {
      // 状态码正常但没有数据
      errorMessage = '没有找到符合条件的日志数据';
      success = false;
    } else {
      // API返回错误
      errorMessage = apiData?.message || '获取日志数据失败';
      success = false;
    }
    
    // 返回标准化的响应
    return new Response(JSON.stringify({
      success,
      status,
      data: result,
      error: errorMessage ? { message: errorMessage } : null,
      meta: {
        query: {
          type,
          table: logTable,
          limit: parsedLimit,
          timeRange: {
            start: startTime,
            end: endTime,
            startLocal: formatLocalTime(startTime),
            endLocal: formatLocalTime(endTime),
            input: {
              start: iso_timestamp_start || null,
              end: iso_timestamp_end || null
            },
            duration: describeDuration()
          },
          sql
        },
        count: result.length,
        timestamp: nowIso,
        timestampLocal: formatLocalTime(nowIso)
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('错误:', error);
    return new Response(JSON.stringify({
      success: false,
      status: 500,
      data: [],
      error: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      meta: {
        timestamp: dayjs().utc().format(),
        timestampLocal: dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
      }
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});