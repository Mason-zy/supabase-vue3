<template>
  <div class="system-setting">
    <h1 class="page-title">系统设置</h1>
    
    <el-card class="setting-card">
      <template #header>
        <div class="card-header">
          <span>基本设置</span>
        </div>
      </template>
      
      <div class="placeholder">
        <el-empty 
          description="开发中..." 
          :image-size="120"
        >
          <el-button type="primary">敬请期待</el-button>
        </el-empty>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 开发中...
</script>

<style scoped lang="scss">
.system-setting {
  .page-title {
    margin-bottom: 20px;
    font-size: 20px;
    color: $primary-color;
  }
  
  .setting-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      span {
        font-size: 16px;
        font-weight: 500;
      }
    }
    
    .placeholder {
      padding: 40px 0;
      display: flex;
      justify-content: center;
    }
  }
}
</style> 