/**
 * 日期格式化函数
 * @param date 日期对象或日期字符串
 * @param format 格式化模板，默认为 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  const d = new Date(date)
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 数字格式化函数
 * @param num 数字
 * @param digits 保留小数位数，默认为2
 * @returns 格式化后的数字字符串
 */
export function formatNumber(num: number, digits: number = 2): string {
  return num.toFixed(digits)
}

/**
 * 将数字转换为中文金额大写
 * @param money 金额
 * @returns 中文大写金额
 */
export function moneyToChinese(money: number): string {
  const cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const cnIntRadice = ['', '拾', '佰', '仟']
  const cnIntUnits = ['', '万', '亿', '兆']
  const cnDecUnits = ['角', '分', '毫', '厘']
  const cnInteger = '整'
  const cnIntLast = '元'
  
  let integerNum = Math.floor(money)
  let decimalNum = Math.round(money * 100) % 100
  
  let chineseStr = ''
  
  if (integerNum === 0) {
    chineseStr = cnNums[0] + cnIntLast + cnInteger
    return chineseStr
  }
  
  let zeroCount = 0
  
  for (let i = 0; i < String(integerNum).length; i++) {
    const n = parseInt(String(integerNum).charAt(i))
    const p = String(integerNum).length - i - 1
    
    const q = p / 4
    const m = p % 4
    
    if (n === 0) {
      zeroCount++
    } else {
      if (zeroCount > 0) {
        chineseStr += cnNums[0]
      }
      zeroCount = 0
      chineseStr += cnNums[n] + cnIntRadice[m]
    }
    
    if (m === 0 && zeroCount < 4) {
      chineseStr += cnIntUnits[q]
    }
  }
  
  chineseStr += cnIntLast
  
  if (decimalNum === 0) {
    chineseStr += cnInteger
  } else {
    for (let i = 0; i < 2; i++) {
      const n = parseInt(String(decimalNum).charAt(i))
      if (n !== 0) {
        chineseStr += cnNums[n] + cnDecUnits[i]
      }
    }
  }
  
  return chineseStr
}

/**
 * 文件大小格式化
 * @param size 文件大小（字节）
 * @returns 格式化后的文件大小
 */
export function formatFileSize(size: number): string {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else if (size < 1024 * 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  } else {
    return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }
} 