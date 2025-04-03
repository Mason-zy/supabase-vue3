import { BaseEntity } from './common'
import { AccidentSeverity, AccidentStatus } from '../enums'

// 事故接口
export interface Accident extends BaseEntity {
  title: string
  description: string
  location: string
  date_time: string
  severity: AccidentSeverity
  status: AccidentStatus
  reporter: string
  responsible_department: string
  cause?: string
  corrective_actions?: CorrectiveAction[]
  attachments?: Attachment[]
}

// 纠正措施
export interface CorrectiveAction extends BaseEntity {
  accident_id: string
  description: string
  responsible_person: string
  due_date: string
  completed_date?: string
  status: 'pending' | 'in_progress' | 'completed'
}

// 附件
export interface Attachment {
  id: string
  accident_id: string
  file_name: string
  file_type: string
  file_size: number
  file_url: string
  uploaded_at: string
  uploaded_by: string
}

// 事故创建参数
export interface CreateAccidentParams {
  title: string
  description: string
  location: string
  date_time: string
  severity: AccidentSeverity
  reporter: string
  responsible_department: string
  cause?: string
}

// 事故更新参数
export interface UpdateAccidentParams {
  title?: string
  description?: string
  location?: string
  date_time?: string
  severity?: AccidentSeverity
  status?: AccidentStatus
  cause?: string
} 