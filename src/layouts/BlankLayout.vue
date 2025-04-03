<template>
  <div class="blank-layout">
    <div class="company-logo">
      <img src="@/assets/images/logo.png" alt="京博石油化工" class="logo-image" />
      <h2 class="logo-text">京博石油化工有限公司<br><span>绩效指标体系电子系统</span></h2>
    </div>
    
    <main class="content">
      <div class="content-card">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
    
    <footer class="footer">
      <p>© {{ currentYear }} 京博石油化工有限公司 版权所有</p>
      <p>推荐使用Chrome、Edge浏览器访问本系统，屏幕分辨率 1920×1080 及以上</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 计算当前年份
const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped lang="scss">
.blank-layout {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #1A365D 0%, #264973 100%);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('@/assets/images/bg-pattern.png');
    background-size: cover;
    opacity: 0.05;
    z-index: 1;
  }
  
  .company-logo {
    margin-top: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2;
    
    .logo-image {
      width: 120px;
      height: auto;
      margin-bottom: 20px;
    }
    
    .logo-text {
      color: white;
      font-size: 24px;
      text-align: center;
      font-weight: 500;
      line-height: 1.5;
      
      span {
        font-size: 18px;
        opacity: 0.9;
      }
    }
  }
  
  .content {
    z-index: 2;
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 60px;
    
    .content-card {
      width: 100%;
      max-width: 450px;
      background-color: white;
      border-radius: $card-border-radius;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
  }
  
  .footer {
    padding: 20px;
    color: rgba(255, 255, 255, 0.7);
    text-align: center;
    font-size: 12px;
    z-index: 2;
    
    p {
      margin: 5px 0;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 