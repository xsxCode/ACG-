<template>
  <el-menu 
    default-active="currentRoute.path" 
    class="sidebar-menu" 
    background-color="#0f172a" 
    text-color="#94a3b8" 
    active-text-color="#fff" 
    router
  >
    <!-- 首页 -->
    <el-menu-item index="/dashboard">
      <el-icon><Menu /></el-icon>      
      <span>首页</span>
    </el-menu-item>

    <!-- 用户管理（当前选中） -->
    <el-menu-item index="/user-manage">
      <el-icon><user /></el-icon>
      <span>用户管理</span>
    </el-menu-item>

    <!-- 内容管理 -->
    <el-menu-item index="/post-list">
      <el-icon><document /></el-icon>
      <span>内容管理</span>
    </el-menu-item>

    <!-- 兴趣圈子 -->
    <el-menu-item index="/circle-list">
      <el-icon><location /></el-icon>
      <span>兴趣圈子</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>

import { useRoute } from 'vue-router';  // 引入路由钩子

const currentRoute = useRoute();  // 获取当前路由实例
</script>

<style scoped>
.sidebar-menu {
  width: 200px;
  min-height: 100vh;
  border-right: none;
}

/* 让菜单项垂直居中 */
:deep(.el-menu-item) {
  display: flex;
  align-items: center;
  padding-left: 20px !important;
}
</style>