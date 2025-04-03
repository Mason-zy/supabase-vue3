import { BaseEntity } from './common'
import { UserRole } from '../enums'

// 用户接口
export interface User extends BaseEntity {
  email: string
  user_name: string
  role: UserRole
  department: string
  is_active: boolean
  last_login?: string
  avatar_url?: string
}

// 用户创建参数
export interface CreateUserParams {
  email: string
  user_name: string
  password: string
  role: UserRole
  department: string
}

// 用户更新参数
export interface UpdateUserParams {
  user_name?: string
  role?: UserRole
  department?: string
  is_active?: boolean
  avatar_url?: string
}

// 用户登录参数
export interface LoginParams {
  email: string
  password: string
}

// 用户权限
export interface Permission {
  id: string
  name: string
  code: string
  description: string
} 