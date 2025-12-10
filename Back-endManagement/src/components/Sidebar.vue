<template>
  <el-menu 
    :default-active="currentRoute.path" 
    class="sidebar-menu" 
    background-color="#0f172a" 
    text-color="#94a3b8" 
    active-text-color="#fff" 
    router
    unique-opened
  >
    <!-- 首页 → 用System分类下的House图标（对应首页入口） -->
    <el-menu-item index="/dashboard">
      <el-icon><House /></el-icon>      
      <span>首页</span>
    </el-menu-item>

    <!-- 用户管理 → 用System分类下的UserFilled图标（对应用户管理） -->
    <el-menu-item index="/user-manage">
      <el-icon><UserFilled /></el-icon>
      <span>用户管理</span>
    </el-menu-item>

    <!-- 帖子管理 → 用Arrow分类下的Document图标（对应帖子/文档） -->
    <el-menu-item index="/post-manage">
      <el-icon><Document /></el-icon>
      <span>帖子管理</span>
    </el-menu-item>

    <!-- 标签管理 → 用Items分类下的CollectionTag图标（对应标签/集合） -->
    <el-menu-item index="/tag-manage">
      <el-icon><CollectionTag /></el-icon>
      <span>标签管理</span>
    </el-menu-item>

    <!-- 兴趣圈子 → 用System分类下的ChatRound图标（对应圈子/聊天） -->
    <el-menu-item index="/circle-manage">
      <el-icon><ChatRound /></el-icon>
      <span>兴趣圈子</span>
    </el-menu-item>

    <!-- 数据统计 → 用System分类下的PieChart图标（对应统计/图表） -->
    <el-menu-item index="/data-stats">
      <el-icon><PieChart /></el-icon>
      <span>数据统计</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { useRoute } from 'vue-router';
// 导入的图标均来自你提供的列表，确保存在无报错
import { 
  House, 
  UserFilled, 
  Document, 
  CollectionTag, 
  ChatRound, 
  PieChart 
} from '@element-plus/icons-vue';

const currentRoute = useRoute();
</script>

<style scoped>
.sidebar-menu {
  width: 200px;
  min-height: 100vh;
  border-right: none;
  font-size: 14px;
}

:deep(.el-menu-item) {
  display: flex;
  align-items: center;
  padding-left: 20px !important;
  height: 50px;
  margin: 2px 0;
}

:deep(.el-menu-item .el-icon) {
  margin-right: 10px;
  font-size: 16px;
}

:deep(.el-menu-item.is-active) {
  background-color: #1e293b !important;
  border-left: 3px solid #3b82f6;
}

:deep(.el-menu-item:hover) {
  background-color: #1e293b !important;
}
</style>