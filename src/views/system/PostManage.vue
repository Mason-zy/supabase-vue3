<template>
  <div class="post-manage">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <h2>岗位管理</h2>
        </div>
      </template>
      <div class="developing">
        <el-empty description="功能开发中...">
          <template #image>
            <el-icon :size="60" style="color: #909399;"><Loading /></el-icon>
          </template>
        </el-empty>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'
</script>

<style scoped>
.post-manage {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  color: #1A365D;
}

.developing {
  padding: 40px 0;
}
</style> 