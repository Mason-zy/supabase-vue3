import { BaseEntity } from './common'

// 报表接口
export interface Report extends BaseEntity {
  title: string
  description: string
  type: 'monthly' | 'quarterly' | 'annual' | 'custom'
  start_date: string
  end_date: string
  created_by: string
  generated_url?: string
  parameters?: ReportParameter[]
}

// 报表参数
export interface ReportParameter {
  name: string
  label: string
  type: 'string' | 'number' | 'date' | 'boolean'
  value: string | number | boolean
}

// 报表模板
export interface ReportTemplate extends BaseEntity {
  name: string
  description: string
  template_type: 'indicators' | 'accidents' | 'compliance' | 'custom'
  thumbnail_url?: string
  parameters: ReportParameter[]
}

// 报表创建参数
export interface CreateReportParams {
  title: string
  description: string
  type: 'monthly' | 'quarterly' | 'annual' | 'custom'
  start_date: string
  end_date: string
  template_id: string
  parameters?: ReportParameter[]
} 