import dayjs from 'dayjs';

/**
 * 格式化日期时间
 * @param date ISO格式的日期字符串或Date对象
 * @param format 格式化模式，默认为 YYYY-MM-DD HH:mm:ss
 * @returns 格式化后的日期字符串
 */
export function formatDateTime(date: string | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return '';
  return dayjs(date).format(format);
}

/**
 * 获取相对于当前时间的日期范围
 * @param days 天数，负数表示过去的日期
 * @returns 日期范围数组 [开始日期, 结束日期]
 */
export function getDateRange(days: number): [Date, Date] {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() + days);
  return [start, end];
}

/**
 * 获取今天的日期范围
 * @returns 今天的日期范围 [今天开始, 今天结束]
 */
export function getTodayRange(): [Date, Date] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  
  return [start, end];
} 