import { supabase } from '../supabase/client'
import type { Database } from '@/types/database'

type Department = Database['public']['Tables']['departments']['Row']
type DepartmentUpdate = Omit<Partial<Department>, 'dept_id'>

export const departmentService = {
  // 获取部门列表
  async getDepartments() {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('order_num')
    
    if (error) throw error
    return data
  },

  // 添加部门
  async addDepartment(department: Omit<Department, 'dept_id'>) {
    const { data, error } = await supabase
      .from('departments')
      .insert(department)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 更新部门
  async updateDepartment(dept_id: number, department: DepartmentUpdate) {
    const { data, error } = await supabase
      .from('departments')
      .update(department)
      .eq('dept_id', dept_id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 删除部门
  async deleteDepartment(dept_id: number) {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('dept_id', dept_id)
    
    if (error) throw error
  },

  // 获取部门详情
  async getDepartmentById(dept_id: number) {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('dept_id', dept_id)
      .single()
    
    if (error) throw error
    return data
  }
} 