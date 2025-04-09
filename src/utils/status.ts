/**
 * 状态码工具函数
 * 提供HTTP状态码的格式化和显示类型判断
 */

/**
 * 获取状态码对应的类型，用于UI显示
 * @param code HTTP状态码
 * @returns 状态码类型：success(2xx), info(3xx), warning(4xx), danger(5xx)
 */
export function getStatusType(code: number | string | null | undefined): string {
  if (!code) return '';
  const statusCode = typeof code === 'string' ? parseInt(code) : code;
  
  if (statusCode < 300) return 'success';
  if (statusCode < 400) return 'info';
  if (statusCode < 500) return 'warning';
  return 'danger';
}

/**
 * 获取状态码的描述信息
 * @param code HTTP状态码
 * @returns 状态码的描述信息
 */
export function getStatusDescription(code: number | string | null | undefined): string {
  if (!code) return '未知状态';
  
  const statusMap: Record<string, string> = {
    '200': 'OK',
    '201': '已创建',
    '204': '无内容',
    '301': '永久重定向',
    '302': '临时重定向',
    '304': '未修改',
    '400': '错误请求',
    '401': '未授权',
    '403': '禁止访问',
    '404': '未找到',
    '405': '方法不允许',
    '408': '请求超时',
    '429': '请求过多',
    '500': '服务器错误',
    '502': '网关错误',
    '503': '服务不可用',
    '504': '网关超时'
  };
  
  const statusCode = typeof code === 'string' ? code : code.toString();
  return statusMap[statusCode] || `状态码 ${statusCode}`;
} 