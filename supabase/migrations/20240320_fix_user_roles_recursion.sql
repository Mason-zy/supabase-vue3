-- 修复用户角色RLS递归问题
-- 将get_current_user_info函数改为SECURITY DEFINER模式以绕过RLS检查

CREATE OR REPLACE FUNCTION public.get_current_user_info()
RETURNS TABLE(
  id uuid, 
  email text, 
  last_sign_in_at timestamp with time zone, 
  nickname character varying, 
  mobile character varying, 
  avatar character varying, 
  gender smallint, 
  status smallint, 
  dept_id bigint, 
  dept_name character varying, 
  dept_code character varying, 
  post_names text, 
  role_names text
)
LANGUAGE sql
SECURITY DEFINER -- 使用函数创建者的权限执行
SET search_path = public
AS $function$
    SELECT 
        u.id,
        u.email,
        u.last_sign_in_at,
        p.nickname,
        p.mobile,
        p.avatar,
        p.gender,
        p.status,
        d.dept_id,
        d.dept_name,
        d.dept_code,
        STRING_AGG(DISTINCT po.post_name, ', ') AS post_names,
        STRING_AGG(DISTINCT r.role_name, ', ') AS role_names
    FROM 
        auth.users u
    JOIN 
        public.user_profiles p ON u.id = p.id
    LEFT JOIN 
        public.departments d ON p.dept_id = d.dept_id
    LEFT JOIN 
        public.user_posts up ON u.id = up.user_id
    LEFT JOIN 
        public.posts po ON up.post_id = po.post_id
    LEFT JOIN 
        public.user_roles ur ON u.id = ur.user_id
    LEFT JOIN 
        public.roles r ON ur.role_id = r.role_id
    WHERE 
        u.id = auth.uid()
    GROUP BY 
        u.id, p.id, d.dept_id;
$function$;

COMMENT ON FUNCTION public.get_current_user_info IS '获取当前用户详细信息（包括部门、岗位和角色），使用SECURITY DEFINER绕过RLS检查';

-- 修改部门表的RLS策略，解决循环依赖问题
DROP POLICY IF EXISTS "部门数据访问策略" ON public.departments;

CREATE POLICY "部门数据访问策略" ON public.departments
    USING (true)  -- 允许所有已认证用户查看部门数据
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.roles r
        JOIN public.user_roles ur ON r.role_id = ur.role_id
        WHERE ur.user_id = auth.uid() AND r.role_key IN ('admin', 'manager')
    ));

-- 对user_roles表的RLS策略进行修复
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

CREATE POLICY "Admins can manage user roles" ON public.user_roles
    USING (
        EXISTS (
            SELECT 1 FROM public.roles r
            WHERE r.role_id IN (
                SELECT ur2.role_id FROM public.user_roles ur2
                WHERE ur2.user_id = auth.uid()
            )
            AND r.role_key = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.roles r
            WHERE r.role_id IN (
                SELECT ur2.role_id FROM public.user_roles ur2
                WHERE ur2.user_id = auth.uid()
            )
            AND r.role_key = 'admin'
        )
    ); 