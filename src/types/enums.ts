// 事故严重程度枚举
export enum AccidentSeverity {
  CRITICAL = 'critical',
  SERIOUS = 'serious',
  MODERATE = 'moderate',
  MINOR = 'minor'
}

// 事故状态枚举
export enum AccidentStatus {
  REPORTED = 'reported',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

// 指标状态枚举
export enum IndicatorStatus {
  NORMAL = 'normal',
  WARNING = 'warning',
  DANGER = 'danger'
}

// 用户角色枚举
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  VIEWER = 'viewer'
} 