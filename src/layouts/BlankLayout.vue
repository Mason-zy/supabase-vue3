<template>
  <div class="blank-layout">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 空白布局，用于登录页面
</script>

<style scoped>
.blank-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f7fafc;
}
</style> 