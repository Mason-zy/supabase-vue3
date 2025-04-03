import { BaseEntity } from './common'
import { IndicatorStatus } from '../enums'

// 指标接口
export interface Indicator extends BaseEntity {
  name: string
  code: string
  description: string
  category: string
  current_value: number
  target_value: number
  unit: string
  status: IndicatorStatus
  parent_id?: string
  children?: Indicator[]
  trend_data?: TrendData[]
}

// 趋势数据
export interface TrendData {
  timestamp: string
  value: number
}

// 指标创建参数
export interface CreateIndicatorParams {
  name: string
  code: string
  description: string
  category: string
  target_value: number
  unit: string
  parent_id?: string
}

// 指标更新参数
export interface UpdateIndicatorParams {
  name?: string
  description?: string
  target_value?: number
  unit?: string
}

// 指标值更新参数
export interface UpdateIndicatorValueParams {
  value: number
  timestamp: string
} 