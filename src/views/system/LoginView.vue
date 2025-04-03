<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-left">
        <div class="logo-section">
          <img src="/logo.svg" alt="京博石油化工" class="logo-image" />
          <h2 class="logo-title">京博石油化工有限公司<br><span>绩效指标体系电子系统</span></h2>
        </div>
        
        <div class="login-card">
          <h2 class="card-title">系统登录</h2>
          
          <form @submit.prevent="handleSubmit" class="login-form">
            <div class="form-group">
              <label for="email" class="form-label">邮箱</label>
              <div class="input-wrapper">
                <i class="fas fa-envelope input-icon"></i>
                <input 
                  id="email"
                  v-model="form.email"
                  type="email"
                  class="form-input"
                  placeholder="请输入邮箱地址"
                  :class="{ 'is-invalid': errors.email }"
                  required
                  autocomplete="email"
                />
              </div>
              <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
            </div>
            
            <div class="form-group">
              <label for="password" class="form-label">
                密码
                <a href="#" class="forget-link" @click.prevent="handleForgetPassword">忘记密码?</a>
              </label>
              <div class="input-wrapper">
                <i class="fas fa-lock input-icon"></i>
                <input 
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="请输入密码"
                  :class="{ 'is-invalid': errors.password }"
                  required
                  autocomplete="current-password"
                />
                <button 
                  type="button" 
                  class="password-toggle" 
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
            </div>
            
            <div class="remember-section">
              <label class="checkbox-container">
                <input type="checkbox" v-model="form.remember" />
                <span class="checkmark"></span>
                <span class="label-text">记住我</span>
              </label>
            </div>
            
            <div v-if="loginError" class="global-error">{{ loginError }}</div>
            
            <button 
              type="submit" 
              class="login-button" 
              :disabled="loading"
            >
              <span v-if="loading">
                <i class="fas fa-spinner fa-spin"></i> 登录中...
              </span>
              <span v-else>登录</span>
            </button>
          </form>
        </div>
      </div>
      
      <div class="login-right">
        <div class="system-intro">
          <h2>安全绩效指标体系</h2>
          <p>基于CCPS标准构建的安全绩效指标体系电子系统，助力石化企业高效管理安全指标、事故分析与报表生成。</p>
          <div class="feature-list">
            <div class="feature-item">
              <i class="fas fa-chart-line"></i>
              <span>指标实时监控</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-shield-alt"></i>
              <span>事故分析预警</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-file-alt"></i>
              <span>报表自动生成</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-cogs"></i>
              <span>系统智能管理</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>© {{ currentYear }} 京博石油化工有限公司 版权所有 &nbsp;|&nbsp; 推荐使用Chrome、Edge浏览器访问本系统，屏幕分辨率 1920×1080 及以上</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/system/auth';

const router = useRouter();
const authStore = useAuthStore();

// 表单数据
const form = reactive({
  email: '',
  password: '',
  remember: false
});

// 表单错误状态
const errors = reactive({
  email: '',
  password: ''
});

// 其他状态
const loading = computed(() => authStore.loading);
const loginError = ref('');
const showPassword = ref(false);
const currentYear = computed(() => new Date().getFullYear());

// 验证表单
const validateForm = () => {
  let isValid = true;
  errors.email = '';
  errors.password = '';
  
  if (!form.email) {
    errors.email = '请输入邮箱地址';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '请输入有效的邮箱地址';
    isValid = false;
  }
  
  if (!form.password) {
    errors.password = '请输入密码';
    isValid = false;
  } else if (form.password.length < 6) {
    errors.password = '密码长度不能少于6个字符';
    isValid = false;
  }
  
  return isValid;
};

// 处理提交
const handleSubmit = async () => {
  // 先清除之前的错误
  loginError.value = '';
  
  // 验证表单
  if (!validateForm()) {
    return;
  }
  
  // 执行登录操作
  const result = await authStore.login({
    email: form.email,
    password: form.password
  });
  
  if (result.success) {
    // 登录成功，跳转到首页或之前的页面
    router.push({ name: 'Dashboard' });
  } else {
    // 显示登录错误
    loginError.value = result.error || '登录失败，请检查邮箱和密码';
  }
};

// 处理忘记密码
const handleForgetPassword = () => {
  router.push({ name: 'ResetPassword' });
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #1A365D 0%, #264973 100%);
  position: relative;
  width: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/bg-pattern.png');
  background-size: cover;
  opacity: 0.05;
  z-index: 1;
  pointer-events: none;
}

.login-content {
  display: flex;
  flex: 1;
  position: relative;
  z-index: 2;
  width: 100%;
}

.login-left {
  width: 50%;
  padding: 0 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.login-right {
  width: 50%;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 80px;
  text-align: center;
}

.system-intro {
  color: white;
  max-width: 600px;
}

.system-intro h2 {
  font-size: 36px;
  font-weight: 600;
  margin-bottom: 20px;
  color: white;
}

.system-intro p {
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 40px;
  opacity: 0.9;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-5px);
}

.feature-item i {
  font-size: 32px;
  color: #F47B20;
  margin-bottom: 15px;
}

.feature-item span {
  font-size: 18px;
  font-weight: 500;
}

.logo-section {
  text-align: center;
  margin-bottom: 30px;
}

.logo-image {
  width: 120px;
  height: auto;
  margin-bottom: 20px;
}

.logo-title {
  color: white;
  font-size: 24px;
  margin: 0;
  font-weight: 500;
  line-height: 1.5;
}

.logo-title span {
  font-size: 18px;
  opacity: 0.9;
}

.login-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 40px;
  animation: fadeIn 0.5s ease-in;
  width: 100%;
  max-width: 550px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.card-title {
  font-size: 28px;
  color: #1A365D;
  text-align: center;
  margin: 0 0 40px 0;
  font-weight: 600;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: #4A5568;
}

.forget-link {
  font-size: 14px;
  color: #4299E1;
  text-decoration: none;
}

.forget-link:hover {
  text-decoration: underline;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: #A0AEC0;
  font-size: 16px;
}

.form-input {
  width: 100%;
  height: 50px;
  padding: 0 16px 0 48px;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #4299E1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  outline: none;
}

.form-input.is-invalid {
  border-color: #E53E3E;
}

.error-message {
  font-size: 14px;
  color: #E53E3E;
  margin-top: 6px;
}

.password-toggle {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: #A0AEC0;
  transition: color 0.2s;
}

.password-toggle:hover {
  color: #4A5568;
}

.remember-section {
  display: flex;
  align-items: center;
}

.checkbox-container {
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  user-select: none;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  height: 0;
  width: 0;
}

.checkmark {
  height: 20px;
  width: 20px;
  background-color: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 4px;
  margin-right: 10px;
}

.checkbox-container:hover input ~ .checkmark {
  border-color: #4299E1;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #1A365D;
  border-color: #1A365D;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
  left: 7px;
  top: 3px;
  width: 6px;
  height: 12px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.label-text {
  font-size: 16px;
  color: #4A5568;
}

.global-error {
  background-color: #FEF2F2;
  color: #E53E3E;
  padding: 16px;
  border-radius: 6px;
  font-size: 15px;
  text-align: center;
  border-left: 4px solid #E53E3E;
}

.login-button {
  background-color: #1A365D;
  color: white;
  border: none;
  border-radius: 6px;
  height: 50px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
  margin-top: 10px;
}

.login-button:hover:not(:disabled) {
  background-color: #F47B20;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.footer {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  z-index: 2;
  padding: 20px 0;
  background: rgba(0, 0, 0, 0.1);
  width: 100%;
}

.footer p {
  margin: 0;
}
</style> 