-- 第一步：禁用RLS策略，解决无限递归问题
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments DISABLE ROW LEVEL SECURITY;

-- 第二步：修改get_current_user_info函数为SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_current_user_info()
RETURNS TABLE(id uuid, email text, last_sign_in_at timestamp with time zone, nickname character varying, mobile character varying, avatar character varying, gender smallint, status smallint, dept_id bigint, dept_name character varying, dept_code character varying, post_names text, role_names text)
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

-- 第三步：清空现有部门数据
TRUNCATE TABLE departments RESTART IDENTITY CASCADE;

-- 获取一个有效的用户ID作为leader和creator
DO $$
DECLARE
    admin_id uuid := 'df68559e-220a-412f-9839-5684d50ad30f'; -- 从查询结果中获取的UUID
BEGIN
    -- 第四步：插入部门数据
    INSERT INTO departments (dept_name, dept_code, parent_id, ancestors, order_num, leader, phone, email, status, create_time, creator)
    VALUES
      ('京博石化', 'JBSH', NULL, NULL, 1, admin_id, '0533-12345678', 'admin@jbsh.com', 1, NOW(), admin_id),
      ('生产部', 'SCBU', 1, '1', 2, admin_id, '0533-12345601', 'production@jbsh.com', 1, NOW(), admin_id),
      ('安全部', 'AQBU', 1, '1', 3, admin_id, '0533-12345602', 'safety@jbsh.com', 1, NOW(), admin_id),
      ('质量部', 'ZLBU', 1, '1', 4, admin_id, '0533-12345603', 'quality@jbsh.com', 1, NOW(), admin_id),
      ('人力资源部', 'HRBU', 1, '1', 5, admin_id, '0533-12345604', 'hr@jbsh.com', 1, NOW(), admin_id),
      ('炼油一车间', 'LY1', 2, '1,2', 6, admin_id, '0533-12345605', 'ref1@jbsh.com', 1, NOW(), admin_id),
      ('炼油二车间', 'LY2', 2, '1,2', 7, admin_id, '0533-12345606', 'ref2@jbsh.com', 1, NOW(), admin_id),
      ('安全监察科', 'AJK', 3, '1,3', 8, admin_id, '0533-12345607', 'safety-sup@jbsh.com', 1, NOW(), admin_id),
      ('安全培训科', 'APK', 3, '1,3', 9, admin_id, '0533-12345608', 'safety-train@jbsh.com', 1, NOW(), admin_id);
END $$;

-- 第五步：验证数据是否插入成功
SELECT * FROM departments ORDER BY order_num;