------------------------------------------
-- 用户管理系统表结构与Supabase Auth对接
------------------------------------------

-- 1. 用户配置文件表 - 关联auth.users
CREATE TABLE public.user_profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  nickname VARCHAR(50),
  mobile VARCHAR(20),
  avatar VARCHAR(255),
  gender SMALLINT DEFAULT 0,  -- 0:未知 1:男 2:女
  dept_id BIGINT,
  status SMALLINT DEFAULT 1,  -- 0:禁用 1:正常
  creator UUID,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updater UUID,
  update_time TIMESTAMP,
  remark VARCHAR(500),
  
  PRIMARY KEY (id)
);

-- 2. 部门表
CREATE TABLE public.departments (
  dept_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  parent_id BIGINT DEFAULT 0,  -- 父部门id
  ancestors VARCHAR(500),      -- 祖级列表
  dept_name VARCHAR(50) NOT NULL,
  dept_code VARCHAR(50),       -- 部门编码
  order_num INTEGER,           -- 显示顺序
  leader UUID,                 -- 负责人
  phone VARCHAR(20),           -- 联系电话
  email VARCHAR(100),          -- 邮箱
  status SMALLINT DEFAULT 1,   -- 0:禁用 1:正常
  creator UUID,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updater UUID,
  update_time TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- 3. 岗位表
CREATE TABLE public.posts (
  post_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_code VARCHAR(50) NOT NULL,  -- 岗位编码
  post_name VARCHAR(50) NOT NULL,  -- 岗位名称
  post_sort INTEGER,               -- 显示顺序
  status SMALLINT DEFAULT 1,       -- 0:禁用 1:正常
  creator UUID,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updater UUID,
  update_time TIMESTAMP,
  remark VARCHAR(500)
);

-- 4. 角色表
CREATE TABLE public.roles (
  role_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL,
  role_key VARCHAR(50) NOT NULL,  -- 角色权限字符串
  role_sort INTEGER,              -- 显示顺序
  data_scope SMALLINT DEFAULT 1,  -- 数据范围（1：全部 2：自定义 3：本部门 4：本部门及以下）
  status SMALLINT DEFAULT 1,      -- 0:禁用 1:正常
  creator UUID,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updater UUID,
  update_time TIMESTAMP,
  remark VARCHAR(500)
);

-- 5. 用户角色关联表
CREATE TABLE public.user_roles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role_id BIGINT NOT NULL REFERENCES public.roles ON DELETE CASCADE,
  UNIQUE (user_id, role_id)
);

-- 6. 用户岗位关联表
CREATE TABLE public.user_posts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  post_id BIGINT NOT NULL REFERENCES public.posts ON DELETE CASCADE,
  UNIQUE (user_id, post_id)
);

-- 7. 菜单权限表
CREATE TABLE public.menus (
  menu_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  parent_id BIGINT DEFAULT 0,  -- 父菜单ID
  name VARCHAR(50),            -- 菜单名称
  path VARCHAR(200),           -- 路由地址
  component VARCHAR(255),      -- 组件路径
  query VARCHAR(255),          -- 路由参数
  is_frame SMALLINT DEFAULT 0, -- 是否为外链（0否 1是）
  is_cache SMALLINT DEFAULT 0, -- 是否缓存（0缓存 1不缓存）
  menu_type CHAR(1),           -- 菜单类型（M目录 C菜单 F按钮）
  visible CHAR(1) DEFAULT '1', -- 菜单显示状态（0隐藏 1显示）
  status SMALLINT DEFAULT 1,   -- 菜单状态（0禁用 1正常）
  perms VARCHAR(100),          -- 权限标识
  icon VARCHAR(100),           -- 菜单图标
  order_num INTEGER,           -- 显示顺序
  creator UUID,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updater UUID,
  update_time TIMESTAMP,
  remark VARCHAR(500)
);

-- 8. 角色菜单关联表
CREATE TABLE public.role_menus (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  role_id BIGINT NOT NULL REFERENCES public.roles ON DELETE CASCADE,
  menu_id BIGINT NOT NULL REFERENCES public.menus ON DELETE CASCADE,
  UNIQUE (role_id, menu_id)
);

-- 9. 角色部门关联表
CREATE TABLE public.role_departments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  role_id BIGINT NOT NULL REFERENCES public.roles ON DELETE CASCADE,
  dept_id BIGINT NOT NULL REFERENCES public.departments ON DELETE CASCADE,
  UNIQUE (role_id, dept_id)
);

-- 10. 外键约束和索引
ALTER TABLE public.user_profiles
ADD CONSTRAINT fk_user_profile_dept
FOREIGN KEY (dept_id) REFERENCES public.departments(dept_id);

-- 添加索引以提高查询性能
CREATE INDEX idx_user_profile_dept ON public.user_profiles(dept_id);
CREATE INDEX idx_dept_parent ON public.departments(parent_id);
CREATE INDEX idx_menu_parent ON public.menus(parent_id);
CREATE INDEX idx_role_sort ON public.roles(role_sort);
CREATE INDEX idx_post_sort ON public.posts(post_sort);

------------------------------------------
-- 行级安全策略 (Row Level Security)
------------------------------------------

-- 用户配置文件表RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and update their own profile"
  ON public.user_profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 修改管理员策略，避免递归查询
CREATE POLICY "Admins can manage all profiles"
  ON public.user_profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND 
      id IN (SELECT user_id FROM public.user_roles WHERE role_id IN (SELECT role_id FROM public.roles WHERE role_key = 'admin'))
    )
  );

-- 部门表RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- 所有已认证用户都可查看激活状态的部门
CREATE POLICY "Authenticated users can view departments"
  ON public.departments
  FOR SELECT
  TO authenticated
  USING (status = 1 AND is_deleted = false);

-- 修改管理员策略，避免递归
CREATE POLICY "Admins can manage departments"
  ON public.departments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND 
      id IN (SELECT user_id FROM public.user_roles WHERE role_id IN (SELECT role_id FROM public.roles WHERE role_key = 'admin'))
    )
  );

-- 岗位表RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view posts"
  ON public.posts
  FOR SELECT
  TO authenticated
  USING (status = 1);

-- 修改管理员策略，避免递归
CREATE POLICY "Admins can manage posts"
  ON public.posts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND 
      id IN (SELECT user_id FROM public.user_roles WHERE role_id IN (SELECT role_id FROM public.roles WHERE role_key = 'admin'))
    )
  );

-- 角色表RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- 所有已认证用户可查看激活的角色
CREATE POLICY "Authenticated users can view roles"
  ON public.roles
  FOR SELECT
  TO authenticated
  USING (status = 1);

-- 修改管理员策略，避免递归
CREATE POLICY "Admins can manage roles"
  ON public.roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND 
      id IN (SELECT user_id FROM public.user_roles WHERE role_id IN (SELECT role_id FROM public.roles WHERE role_key = 'admin'))
    )
  );

-- 用户角色关联表RLS -- 解决递归问题的关键
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 允许所有已认证用户查询用户角色关联表，解决递归问题
CREATE POLICY "All authenticated users can view user_roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (true);

-- 用户只能修改自己的角色关联，管理员例外
CREATE POLICY "Users can manage their own roles"
  ON public.user_roles
  FOR INSERT UPDATE DELETE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 修改管理员策略，避免递归
CREATE POLICY "Admins can manage all user roles"
  ON public.user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND 
      id IN (SELECT user_id FROM public.user_roles WHERE role_id IN (SELECT role_id FROM public.roles WHERE role_key = 'admin'))
    )
  );

-- 用户岗位关联表RLS
ALTER TABLE public.user_posts ENABLE ROW LEVEL SECURITY;

-- 所有认证用户可查看用户岗位关联
CREATE POLICY "Authenticated users can view user_posts"
  ON public.user_posts
  FOR SELECT
  TO authenticated
  USING (true);

-- 用户只能修改自己的岗位关联，管理员例外
CREATE POLICY "Users can manage their own posts"
  ON public.user_posts
  FOR INSERT UPDATE DELETE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 修改管理员策略，避免递归
CREATE POLICY "Admins can manage all user posts"
  ON public.user_posts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND 
      id IN (SELECT user_id FROM public.user_roles WHERE role_id IN (SELECT role_id FROM public.roles WHERE role_key = 'admin'))
    )
  );

-- 菜单权限表RLS
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view menus"
  ON public.menus
  FOR SELECT
  TO authenticated
  USING (status = 1);

-- 修改管理员策略，避免递归
CREATE POLICY "Admins can manage menus"
  ON public.menus
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND 
      id IN (SELECT user_id FROM public.user_roles WHERE role_id IN (SELECT role_id FROM public.roles WHERE role_key = 'admin'))
    )
  );

-- 角色菜单关联表RLS
ALTER TABLE public.role_menus ENABLE ROW LEVEL SECURITY;

-- 所有认证用户可查看角色菜单关联
CREATE POLICY "Authenticated users can view role_menus"
  ON public.role_menus
  FOR SELECT
  TO authenticated
  USING (true);

-- 修改管理员策略，避免递归
CREATE POLICY "Admins can manage role menus"
  ON public.role_menus
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND 
      id IN (SELECT user_id FROM public.user_roles WHERE role_id IN (SELECT role_id FROM public.roles WHERE role_key = 'admin'))
    )
  );

-- 角色部门关联表RLS
ALTER TABLE public.role_departments ENABLE ROW LEVEL SECURITY;

-- 所有认证用户可查看角色部门关联
CREATE POLICY "Authenticated users can view role_departments"
  ON public.role_departments
  FOR SELECT
  TO authenticated
  USING (true);

-- 修改管理员策略，避免递归
CREATE POLICY "Admins can manage role departments"
  ON public.role_departments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND 
      id IN (SELECT user_id FROM public.user_roles WHERE role_id IN (SELECT role_id FROM public.roles WHERE role_key = 'admin'))
    )
  );

------------------------------------------
-- 触发器和功能函数
------------------------------------------

-- 创建处理新用户注册的函数
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    nickname,
    mobile,
    avatar,
    gender,
    create_time
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', NEW.email),
    NEW.raw_user_meta_data->>'mobile',
    NEW.raw_user_meta_data->>'avatar',
    COALESCE((NEW.raw_user_meta_data->>'gender')::smallint, 0),
    NEW.created_at
  );

  -- 如果有默认角色，为新用户分配
  INSERT INTO public.user_roles (user_id, role_id)
  SELECT NEW.id, role_id FROM public.roles WHERE role_key = 'user';  -- 这里假设有一个'user'角色

  RETURN NEW;
END;
$$;

-- 创建在auth.users中的触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 修改为SECURITY DEFINER以避免递归问题
CREATE OR REPLACE FUNCTION public.get_current_user_info()
RETURNS TABLE (
  id UUID,
  email TEXT,
  last_sign_in_at TIMESTAMPTZ,
  nickname VARCHAR(50),
  mobile VARCHAR(20),
  avatar VARCHAR(255),
  gender SMALLINT,
  status SMALLINT,
  dept_id BIGINT,
  dept_name VARCHAR(50),
  dept_code VARCHAR(50),
  post_names TEXT,
  role_names TEXT
) 
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public, auth
AS $$
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
$$;

COMMENT ON FUNCTION public.get_current_user_info IS '获取当前用户详细信息（包括部门、岗位和角色），使用SECURITY DEFINER绕过RLS检查';

-- 修改为SECURITY DEFINER以避免递归问题
CREATE OR REPLACE FUNCTION public.get_user_info(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  last_sign_in_at TIMESTAMPTZ,
  nickname VARCHAR(50),
  mobile VARCHAR(20),
  avatar VARCHAR(255),
  gender SMALLINT,
  status SMALLINT,
  dept_id BIGINT,
  dept_name VARCHAR(50),
  dept_code VARCHAR(50),
  post_names TEXT,
  role_names TEXT
) 
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public, auth
AS $$
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
        u.id = p_user_id
        AND EXISTS (
          SELECT 1 FROM public.user_roles ur2
          JOIN public.roles r2 ON ur2.role_id = r2.role_id
          WHERE ur2.user_id = auth.uid() AND r2.role_key = 'admin'
        )
    GROUP BY 
        u.id, p.id, d.dept_id;
$$;

COMMENT ON FUNCTION public.get_user_info IS '允许管理员获取任意用户的详细信息，使用SECURITY DEFINER绕过RLS检查';