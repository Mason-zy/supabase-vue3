-- 禁用相关表的RLS以解决无限递归问题
ALTER TABLE public.departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- 修复user_roles表上有问题的策略
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "admin_user_roles_policy" ON public.user_roles;

-- 创建一个不会导致递归的新策略
CREATE POLICY "admin_access_policy" ON public.user_roles
    USING (auth.uid() IN (
        SELECT u.id FROM auth.users u 
        WHERE u.email = '1@qq.com' -- 将此处改为您的管理员邮箱
    ));

-- 确保用户可以查看自己的角色
CREATE POLICY "users_view_own_roles" ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

-- 使用SECURITY DEFINER模式优化get_current_user_info函数
-- 这样函数将绕过RLS检查，避免递归
CREATE OR REPLACE FUNCTION public.get_current_user_info()
RETURNS TABLE(id uuid, email text, last_sign_in_at timestamp with time zone, 
              nickname character varying, mobile character varying, 
              avatar character varying, gender smallint, status smallint, 
              dept_id bigint, dept_name character varying, dept_code character varying, 
              post_names text, role_names text)
LANGUAGE sql
SECURITY DEFINER
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
    LEFT JOIN 
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
        u.id, p.nickname, p.mobile, p.avatar, p.gender, p.status, 
        d.dept_id, d.dept_name, d.dept_code;
$function$;

COMMENT ON FUNCTION public.get_current_user_info IS '获取当前用户详细信息（包括部门、岗位和角色），使用SECURITY DEFINER绕过RLS检查';

-- 确保角色表的RLS也不会导致递归问题
DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;

CREATE POLICY "super_admin_policy" ON public.roles
    USING (auth.uid() IN (
        SELECT u.id FROM auth.users u 
        WHERE u.email = '1@qq.com' -- 将此处改为您的管理员邮箱
    ));

CREATE POLICY "users_view_roles" ON public.roles
    FOR SELECT
    USING (status = 1); 