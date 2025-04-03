<template>
  <div class="reset-container">
    <div class="reset-content">
      <div class="reset-left">
        <div class="logo-section">
          <img src="/logo.svg" alt="京博石油化工" class="logo-image" />
          <h2 class="logo-title">京博石油化工有限公司<br><span>绩效指标体系电子系统</span></h2>
        </div>
        
        <div class="reset-card">
          <h2 class="card-title">重置密码</h2>
          
          <div v-if="isSuccess" class="success-message">
            <i class="fas fa-check-circle success-icon"></i>
            <h3>邮件已发送</h3>
            <p>重置密码的链接已发送到您的邮箱，请查收后按提示操作。</p>
            <button class="action-button" @click="router.push('/auth/login')">
              返回登录
            </button>
          </div>
          
          <form v-else @submit.prevent="handleSubmit" class="reset-form">
            <div class="form-group">
              <label for="email" class="form-label">邮箱地址</label>
              <div class="input-wrapper">
                <i class="fas fa-envelope input-icon"></i>
                <input 
                  id="email"
                  v-model="email"
                  type="email"
                  class="form-input"
                  placeholder="请输入您的邮箱地址"
                  :class="{ 'is-invalid': error }"
                  required
                  autocomplete="email"
                />
              </div>
              <div v-if="error" class="error-message">{{ error }}</div>
              <div class="input-desc">
                我们将发送重置密码的链接到此邮箱
              </div>
            </div>
            
            <div class="action-buttons">
              <button type="submit" class="action-button" :disabled="loading">
                <span v-if="loading">
                  <i class="fas fa-spinner fa-spin"></i> 发送中...
                </span>
                <span v-else>发送重置链接</span>
              </button>
              <button type="button" class="back-button" @click="router.push('/auth/login')">
                返回登录
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div class="reset-right">
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import authService from '@/services/supabase/auth';

const router = useRouter();
const email = ref('');
const error = ref('');
const loading = ref(false);
const isSuccess = ref(false);
const currentYear = computed(() => new Date().getFullYear());

const handleSubmit = async () => {
  if (!email.value) {
    error.value = '请输入邮箱地址';
    return;
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    error.value = '请输入有效的邮箱地址';
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    const { error: resetError } = await authService.resetPassword(email.value);
    
    if (resetError) {
      throw resetError;
    }
    
    // 发送成功
    isSuccess.value = true;
  } catch (err: any) {
    console.error('重置密码失败:', err);
    error.value = err.message || '重置密码请求失败，请稍后再试';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.reset-container {
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

.reset-container::before {
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

.reset-content {
  display: flex;
  flex: 1;
  position: relative;
  z-index: 2;
  width: 100%;
}

.reset-left {
  width: 50%;
  padding: 0 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.reset-right {
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

.reset-card {
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

.reset-form {
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
  font-size: 16px;
  font-weight: 500;
  color: #4A5568;
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

.input-desc {
  font-size: 14px;
  color: #718096;
  margin-top: 6px;
}

.error-message {
  font-size: 14px;
  color: #E53E3E;
  margin-top: 6px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-button {
  background-color: #1A365D;
  color: white;
  border: none;
  border-radius: 6px;
  height: 50px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.action-button:hover:not(:disabled) {
  background-color: #F47B20;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.action-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.back-button {
  background-color: transparent;
  color: #4A5568;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  height: 50px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background-color: #F7FAFC;
  border-color: #CBD5E0;
}

.success-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  font-size: 56px;
  color: #2F855A;
  margin-bottom: 20px;
}

.success-message h3 {
  font-size: 22px;
  color: #1A365D;
  margin: 0 0 16px 0;
}

.success-message p {
  font-size: 16px;
  color: #4A5568;
  margin-bottom: 30px;
  line-height: 1.6;
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