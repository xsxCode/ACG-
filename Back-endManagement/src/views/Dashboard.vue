<template>
  <el-container style="height: 100vh;">
    <!-- 左侧侧边栏 -->
    <el-aside width="200px" style="background: #0f172a;">
      <Sidebar />
    </el-aside>

    <!-- 右侧主内容区 -->
    <el-container>
      <!-- 顶部栏 -->
      <el-header style="padding: 0 20px; border-bottom: 1px solid #e5e7eb; background: white;">
        <div class="header-content">
          <h2 style="margin: 0;">首页</h2>
        </div>
      </el-header>

      <!-- 主要内容区 -->
      <el-main class="dashboard-main">
        <!-- 1.数据卡区 -->
        <div class="data-cards">
          <!-- 用户数据卡片 -->
          <el-card class="data-card" @click="goToUserManage">
            <div class="card-title">用户数据</div>
            <el-statistic 
              title="总用户数"
              :value="userStats.total"
              value-style="{fontSize: '24px'}"
            />
            <el-statistic
              title="今日新增"
              :value="userStats.todayNew"
              value-style="{fontSize: '20px', color: '#10b981'}"
              prefix="+"
            />
          </el-card>

          <!-- 内容数据卡片 -->
          <el-card class="data-card" @click="goToContentManage">
            <div class="card-title">内容数据</div>
            <el-statistic
              title="总帖子数"
              :value="contentStats.total"
              value-style="{fontSize: '24px'}"
            />
            <el-statistic
              title="待审核"
              :value="contentStats.pending"
              value-style="{fontSize: '20px', color: '#ef4444'}"
            />
          </el-card>

          <!-- 系统状态卡片 -->
          <el-card class="data-card">
            <div class="card-title">系统状态</div>
            <div class="system-status-item">
              <span>服务器负载</span>
              <el-progress
                :percentage="systemStatus.load"
                :stroke-color="getLoadColor(systemStatus.load)"
                style="width: 150px;"
              />
            </div>
            <div class="system-status-item">
              <span>运行时间</span>
              <span>{{ systemStatus.runTime }}</span>
            </div>
          </el-card>
        </div>

        <!-- 2. 快捷操作区 -->
        <el-card class="operation-card">
          <div class="operation-group">
            <div class="group-title">用户管理</div>
            <el-input 
              v-model="userSearchKey"
              placeholder="搜索用户名/ID"
              style="width: 200px;"
              prefix-icon="Search"
            />
            <el-button type="primary" @click="viewAllUsers">查看全部用户</el-button>
            <el-button type="warning" @click="banManage">封禁管理</el-button>
          </div>

          <div class="operation-group">
            <div class="group-title">内容管理</div>
            <el-button type="primary" @click="checkPendingContent">待审核内容</el-button>
            <el-button type="success" @click="viewHotContent">热门内容</el-button>
            <el-select
              v-model="contentType"
              placeholder="选择类型"
              style="width: 120px;"
            >
              <el-option label="帖子" value="post" />
              <el-option label="评论" value="comment" />
              <el-option label="圈子" value="circle" />
            </el-select>
          </div>
        </el-card>

        <!-- 3.最近动态列表 -->
        <el-card class="timeline-card">
          <div class="card-title">最近动态</div>
          <el-timeline>
            <el-timeline-item
              v-for="(event,index) in latestEvents"
              :key="index"
              :timestamp="event.time"
            >
              <div class="event-content">
                <span class="event-type">{{ event.type }}</span>
                <span class="event-subject ">{{ event.subject }}</span>
                <el-button
                  size="small"
                  type="text"
                  @click="handleEvent(event)"
                >
                  {{ event.actionText }}
                </el-button>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
// import { ElMessage } from 'element-plus';
import Sidebar from '../components/Sidebar.vue'; // 引入侧边栏组件

// 1. 定义数据变量
const userStats = ref({
  total: 0,
  todayNew: 0 // 修复拼写
});

const contentStats = ref({
  total: 0,
  pending: 0
});

const systemStatus = ref({
  load: 0,
  runTime: '0天0时0分' // 修复初始值类型
});

const latestEvents = ref([]); // 修复拼写

const userSearchKey = ref(''); // 修复拼写
const contentType = ref('');

// 2. 页面加载时获取数据
onMounted(() => {
  fetchDashboardData();
  setInterval(fetchDashboardData, 5 * 60 * 1000); // 修复拼写
});

// 3. 数据获取函数
const fetchDashboardData = async () => {
  try {
    // 模拟数据（实际项目替换为接口请求）
    userStats.value = { total: 156, todayNew: 8 };
    contentStats.value = { total: 320, pending: 12 };
    systemStatus.value = { load: 45, runTime: '15天3时20分' };
    latestEvents.value = [
      { time: '2025-11-06 14:30', type: '用户注册', subject: '新用户“二次元控”注册', actionText: '查看' },
      { time: '2025-11-06 11:20', type: '内容发布', subject: '用户“动漫达人”发布新帖子', actionText: '审核' }
    ];
  } catch (error) {
    ElMessage.error('数据加载失败，请刷新页面重试');
    console.error('数据获取错误：', error);
  }
};

// 4. 事件处理函数
const goToUserManage = () => ElMessage.success('跳转到用户管理页面');
const goToContentManage = () => ElMessage.success('跳转到内容管理页面');
const viewAllUsers = () => ElMessage.success('查看全部用户');
const banManage = () => ElMessage.success('进入封禁管理');
const checkPendingContent = () => ElMessage.success('查看待审核内容');
const viewHotContent = () => ElMessage.success('查看热门内容');
const handleEvent = (event) => ElMessage.success(`处理事件:${event.actionText}`); // 修复模板字符串

// 5. 负载颜色函数
const getLoadColor = (load) => {
  if (load < 60) return '#10b981';
  if (load < 80) return '#f59e0b';
  return '#ef4444';
};
</script>

<style scoped>
/* 保持原有样式不变 */
.dashboard-header {
  background-color: #165dff;
  color: white;
  padding: 0 20px;
}
.header-title {
  font-size: 18px;
  line-height: 60px;
}
.dashboard-main {
  padding: 20px;
}
.data-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.data-card {
  flex: 1;
  min-width: 250px;
  cursor: pointer;
}
.card-title {
  font-size: 16px;
  margin-bottom: 15px;
  color: #666;
}
.system-status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 15px 0;
}
.operation-card {
  padding: 20px;
  margin-bottom: 20px;
}
.operation-group {
  margin-bottom: 15px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}
.operation-group:last-child {
  border-bottom: none;
}
.group-title {
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
}
.operation-group button,
.operation-group .el-input,
.operation-group .el-select {
  margin-right: 10px;
  margin-bottom: 10px;
}
.timeline-card {
  padding: 20px;
}
.event-content {
  display: flex;
  align-items: center;
  gap: 10px;
}
.event-type {
  font-weight: 500;
}
.event-subject {
  flex: 1;
}
</style>