import { supabase } from './client'

interface LogQuery {
  logType: string;
  query: string;
  limit?: number;
}

// 定义模板类型接口
interface LogTemplate {
  title: string;
  logType: string;
  query: string;
}

interface LogTemplates {
  [key: string]: LogTemplate;
}

// 日志服务器的URL
const LOG_SERVER_URL = import.meta.env.VITE_LOG_SERVER_URL || 'http://localhost:3000';

export const logService = {
  // 获取Supabase日志
  async getLogs({ logType, query, limit = 100 }: LogQuery) {
    try {
      console.log(`获取${logType}日志数据，限制：${limit}条`)
      
      // 调用日志服务器API
      try {
        const response = await fetch(`${LOG_SERVER_URL}/api/logs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ logType, limit })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('日志服务器返回错误:', errorData);
          throw new Error(errorData.message || `服务器返回${response.status}错误`);
        }
        
        const data = await response.json();
        
        // 检查响应格式
        if (data && data.data && Array.isArray(data.data)) {
          console.log(`成功获取${data.data.length}条日志记录`);
          return data.data;
        } else if (Array.isArray(data)) {
          console.log(`成功获取${data.length}条日志记录`);
          return data;
        } else {
          console.warn('日志服务器返回了意外的格式:', data);
          throw new Error('日志数据格式不正确');
        }
      } catch (apiError) {
        console.warn('日志服务器API调用失败，回退到模拟数据:', apiError);
        // API调用可能失败，使用模拟数据
        return getMockLogs(logType);
      }
    } catch (error: any) {
      console.error('获取Supabase日志出错:', error);
      return getMockLogs(logType);
    }
  },

  // 获取预设的查询模板
  getQueryTemplates(): LogTemplates {
    return {
      apiRequests: {
        title: 'API请求日志',
        logType: 'edge_logs', 
        query: '获取API请求日志'
      },
      authLogs: {
        title: '认证日志',
        logType: 'auth_logs',
        query: '获取认证日志'
      },
      databaseLogs: {
        title: '数据库操作日志',
        logType: 'postgres_logs',
        query: '获取数据库日志'
      },
      errorLogs: {
        title: '错误日志',
        logType: 'edge_logs',
        query: '获取错误日志(状态码>=400)'
      },
      userActivities: {
        title: '用户活动',
        logType: 'auth_logs',
        query: '获取用户登录登出活动'
      }
    }
  }
}

// 为测试提供模拟日志数据
function getMockLogs(logType: string) {
  const currentTime = new Date().toISOString()
  const yesterdayTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  
  switch(logType) {
    case 'auth_logs':
      return [
        { time: currentTime, event_message: '模拟数据: User admin@example.com signed in', user_id: 'admin-123' },
        { time: currentTime, event_message: '模拟数据: User user1@example.com signed in', user_id: 'user-456' },
        { time: yesterdayTime, event_message: '模拟数据: User admin@example.com signed out', user_id: 'admin-123' },
        { time: yesterdayTime, event_message: '模拟数据: Password reset requested for user2@example.com', user_id: 'user-789' },
        { time: yesterdayTime, event_message: '模拟数据: User user3@example.com failed to sign in: incorrect password', user_id: 'user-101' }
      ];
    case 'edge_logs':
      return [
        { time: currentTime, message: '模拟数据: GET请求到 /api/users', function_id: 'api-handler', method: 'GET', path: '/api/users', status_code: 200 },
        { time: currentTime, message: '模拟数据: POST请求到 /api/departments', function_id: 'api-handler', method: 'POST', path: '/api/departments', status_code: 201 },
        { time: currentTime, message: '模拟数据: PUT请求到 /api/users/123', function_id: 'api-handler', method: 'PUT', path: '/api/users/123', status_code: 200 },
        { time: yesterdayTime, message: '模拟数据: GET请求到不存在的路径', function_id: 'api-handler', method: 'GET', path: '/api/nonexistent', status_code: 404 },
        { time: yesterdayTime, message: '模拟数据: 登录失败', function_id: 'auth-handler', method: 'POST', path: '/api/auth/login', status_code: 401 }
      ];
    case 'postgres_logs':
      return [
        { time: currentTime, event_message: '模拟数据: UPDATE users SET last_login = NOW() WHERE id = 123' },
        { time: currentTime, event_message: '模拟数据: INSERT INTO departments (name, code) VALUES (\'测试部门\', \'TEST\')' },
        { time: yesterdayTime, event_message: '模拟数据: DELETE FROM temp_data WHERE created_at < NOW() - INTERVAL \'7 days\'' },
        { time: yesterdayTime, event_message: '模拟数据: SELECT * FROM users WHERE email = \'admin@example.com\'' },
        { time: yesterdayTime, event_message: '模拟数据: CREATE TABLE new_table (id serial PRIMARY KEY, name text)' }
      ];
    default:
      return [
        { time: currentTime, message: '模拟数据 - 当前日志类型没有预设的模拟数据' }
      ];
  }
} 