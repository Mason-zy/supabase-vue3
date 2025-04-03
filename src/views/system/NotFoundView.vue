<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1 class="error-title">页面未找到</h1>
      <p class="error-message">您访问的页面不存在或已被移动到其他位置</p>
      <div class="error-actions">
        <router-link to="/" class="back-home">
          <i class="fas fa-home"></i> 返回首页
        </router-link>
        <button @click="goBack" class="go-back">
          <i class="fas fa-arrow-left"></i> 返回上一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f7fafc;
  padding: 20px;
}

.not-found-content {
  text-align: center;
  max-width: 500px;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: #1A365D;
  line-height: 1;
  margin-bottom: 20px;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
}

.error-title {
  font-size: 32px;
  font-weight: 600;
  color: #2D3748;
  margin-bottom: 16px;
}

.error-message {
  font-size: 16px;
  color: #718096;
  margin-bottom: 32px;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.back-home, .go-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

.back-home {
  background-color: #1A365D;
  color: white;
  text-decoration: none;
}

.back-home:hover {
  background-color: #F47B20;
}

.go-back {
  background-color: white;
  color: #4A5568;
  border: 1px solid #E2E8F0;
}

.go-back:hover {
  background-color: #F7FAFC;
  border-color: #CBD5E0;
}

@media (max-width: 576px) {
  .error-code {
    font-size: 80px;
  }

  .error-title {
    font-size: 24px;
  }

  .error-actions {
    flex-direction: column;
  }
}
</style> 