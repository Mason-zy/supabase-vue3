<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/system/auth';

const authStore = useAuthStore();

onMounted(async () => {
  // 初始化认证状态
  await authStore.initialize();
});
</script>

<template>
  <router-view />
</template>

<style>
/* 全局样式 */
html, body {
  margin: 0;
  padding: 0;
  font-family: "Microsoft YaHei", "微软雅黑", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  width: 100%;
}

#app {
  height: 100%;
  width: 100%;
}
</style>
