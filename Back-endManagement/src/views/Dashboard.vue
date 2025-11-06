<template>
  <el-container class="dashboard-container">
    <!-- 左侧侧边栏 -->
    <el-aside width="220px" class="sidebar-container">
       <Sidebar />
    </el-aside>

    <!-- 右侧主内容区 -->
    <el-main>
      <!-- 数据卡片区域 -->
      <el-row :gutter="20" class="card-row">
        <el-col :xs="24" :sm="8">
          <el-card shadow="hover">
            <el-statistic title="用户数据" :value="7048" suffix="人" />
            <template #extra>
              <el-button type="text" size="small">详情</el-button>
            </template>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-card shadow="hover">
            <el-statistic title="内容数据" :value="212" suffix="条" />
            <template #extra>
              <el-button type="text" size="small">详情</el-button>
            </template>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-card shadow="hover">
            <el-statistic title="系统状态" :value="262" suffix="项" />
            <template #extra>
              <el-button type="text" size="small">详情</el-button>
            </template>
          </el-card>
        </el-col>
      </el-row>

      <!-- 图表区域 -->
      <el-row :gutter="20" class="chart-row">
        <el-col :xs="24" :md="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>圈子管理</span>
                <el-button-group>
                  <el-button type="text" size="small">对比</el-button>
                  <el-button type="text" size="small">进度</el-button>
                </el-button-group>
              </div>
            </template>
            <div ref="lineChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>快捷操作区</span>
                <el-button type="text" size="small">进度</el-button>
              </div>
            </template>
            <div ref="pieChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="chart-row">
        <el-col :xs="24" :md="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>快捷操作区</span>
                <el-button type="text" size="small">进度</el-button>
              </div>
            </template>
            <div ref="barChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>用户管理与内容管理</span>
                <el-button type="text" size="small">更多</el-button>
              </div>
            </template>
            <div ref="progressRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 最近动态 -->
      <el-card shadow="hover" class="timeline-card">
        <template #header>
          <div class="card-header">
            <span>最近动态</span>
            <el-button type="primary" size="small">添加</el-button>
          </div>
        </template>
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in timelineData"
            :key="index"
            :timestamp="item.time"
            placement="top"
          >
            <el-avatar :src="item.avatar" />
            <span>{{ item.content }}</span>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import { House, User, Document, Collection, Setting } from '@element-plus/icons-vue';
import Sidebar from '@/components/Sidebar.vue';

// 侧边栏激活菜单
const activeMenu = ref('/dashboard');

// 图表容器 Ref
const lineChartRef = ref(null);
const pieChartRef = ref(null);
const barChartRef = ref(null);
const progressRef = ref(null);

// 时间线数据
const timelineData = ref([
  {
    time: '2023-03-24',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    content: 'ACG碰碰部落-最新动态列表'
  },
  {
    time: '2023-03-25',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    content: 'ACG碰碰部落-社区活动更新'
  },
  {
    time: '2023-03-26',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    content: 'ACG概念馆整理'
  }
]);

// 初始化 ECharts 图表
const initCharts = () => {
  // 折线图（圈子管理）
  const lineChart = echarts.init(lineChartRef.value);
  lineChart.setOption({
    xAxis: { type: 'category', data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    yAxis: { type: 'value' },
    series: [{
      data: [20, 30, 40, 50, 60, 70, 80, 75, 85, 90],
      type: 'line',
      smooth: true,
      itemStyle: { color: '#409EFF' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: 'rgba(64, 158, 255, 0.2)' }, { offset: 1, color: 'rgba(64, 158, 255, 0)' }]
        }
      }
    }],
    grid: { left: '3%', right: '4%', bottom: '3%', top: '20%', containLabel: true }
  });

  // 饼图
  const pieChart = echarts.init(pieChartRef.value);
  pieChart.setOption({
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      data: [
        { value: 60, name: '社团', itemStyle: { color: '#409EFF' } },
        { value: 40, name: '主份', itemStyle: { color: '#e5e9f2' } }
      ]
    }]
  });

  // 柱状图
  const barChart = echarts.init(barChartRef.value);
  barChart.setOption({
    xAxis: { type: 'category', data: ['104', '214', '34', '34', '64', '84', '204'] },
    yAxis: { type: 'value' },
    series: [
      { data: [20, 40, 60, 70, 90, 50, 30], type: 'bar', itemStyle: { color: '#409EFF' } },
      { data: [10, 20, 30, 40, 50, 20, 10], type: 'bar', itemStyle: { color: '#e5e9f2' } }
    ],
    grid: { left: '3%', right: '4%', bottom: '3%', top: '20%', containLabel: true }
  });

  // 进度条图表
  const progressChart = echarts.init(progressRef.value);
  progressChart.setOption({
    xAxis: {
      type: 'category',
      data: ['用户管理与内容管理', '用户管理', '用户', '内容管理', '功能', '进度'],
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: '#606266' }
    },
    yAxis: { show: false },
    series: [{
      type: 'bar',
      data: [90, 80, 70, 60, 50, 40],
      barWidth: 10,
      barGap: '-100%',
      itemStyle: {
        color: ({ dataIndex }) => {
          const colors = ['#409EFF', '#409EFF', '#409EFF', '#409EFF', '#e5e9f2', '#e5e9f2'];
          return colors[dataIndex];
        }
      }
    }],
    grid: { left: '0', right: '0', bottom: '0', top: '0', containLabel: true }
  });
};

// 页面挂载后初始化图表
onMounted(() => {
  initCharts();
  // 监听窗口 resize，保证图表自适应
  window.addEventListener('resize', () => {
    echarts.getInstanceByDom(lineChartRef.value)?.resize();
    echarts.getInstanceByDom(pieChartRef.value)?.resize();
    echarts.getInstanceByDom(barChartRef.value)?.resize();
    echarts.getInstanceByDom(progressRef.value)?.resize();
  });
});
</script>

<style scoped>
.dashboard-container {
  height: 100vh;
  display: flex;
}

.sidebar-menu {
  height: 100vh;
}

.card-row, .chart-row {
  margin-bottom: 20px;
}

.chart-container {
  width: 100%;
  height: 250px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timeline-card >>> .el-timeline-item__node {
  width: 16px;
  height: 16px;
  background-color: #409EFF;
}

.timeline-card >>> .el-avatar {
  margin-right: 10px;
}
</style>