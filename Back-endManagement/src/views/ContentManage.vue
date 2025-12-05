<template>
  <!-- 整体布局：侧边栏 + 主内容 -->
  <div class="layout-container">
    <!-- 复用左侧导航栏 -->
    <Sidebar />

    <!-- 帖子管理主内容区 -->
    <div class="post-manage-page">
      <!-- 面包屑 -->
      <el-breadcrumb separator="/" class="mb-4">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>帖子管理</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 筛选区 -->
      <el-card class="filter-card mb-4">
        <el-form :model="filterForm" inline @submit.prevent="fetchPosts">
          <el-form-item label="标题">
            <el-input v-model="filterForm.title" placeholder="请输入帖子标题" clearable />
          </el-form-item>
          <el-form-item label="标签">
            <el-select v-model="filterForm.tagId" placeholder="全部标签" clearable>
              <el-option label="技术" value="tech" />
              <el-option label="产品" value="product" />
            </el-select>
          </el-form-item>
          <el-form-item label="圈子">
            <el-select v-model="filterForm.circleId" placeholder="全部圈子" clearable>
              <el-option label="前端圈" value="frontend" />
              <el-option label="产品圈" value="product" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
              <el-option label="已发布" value="published" />
              <el-option label="草稿" value="draft" />
              <el-option label="已下架" value="offline" />
            </el-select>
          </el-form-item>
          <el-form-item label="时间">
            <el-date-picker v-model="filterForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="fetchPosts">搜索</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 操作区 + 列表 -->
      <el-card>
        <!-- 操作区 -->
        <div class="operate-bar mb-4">
          <div class="left">
            <el-dropdown @command="handleBatchOperate">
              <el-button type="primary" icon="el-icon-s-tools">批量操作</el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="delete">批量删除</el-dropdown-item>
                <el-dropdown-item command="publish">批量发布</el-dropdown-item>
                <el-dropdown-item command="offline">批量下架</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <div class="right">
            <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增帖子</el-button>
            <span class="total-text">共 {{ total }} 条数据</span>
          </div>
        </div>

        <!-- 列表区 -->
        <el-table :data="postList" border @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="title" label="帖子标题" min-width="200" show-overflow-tooltip />
          <el-table-column prop="circleName" label="所属圈子" width="120" />
          <el-table-column prop="tagNames" label="标签" width="120" />
          <el-table-column prop="author" label="作者" width="100" />
          <el-table-column prop="publishTime" label="发布时间" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'published' ? 'success' : scope.row.status === 'draft' ? 'info' : 'warning'">
                {{ scope.row.status === 'published' ? '已发布' : scope.row.status === 'draft' ? '草稿' : '已下架' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button type="text" :type="scope.row.status === 'published' ? 'warning' : 'success'" @click="handleStatusChange(scope.row)">
                {{ scope.row.status === 'published' ? '下架' : scope.row.status === 'draft' ? '发布' : '上架' }}
              </el-button>
              <el-button type="text" danger @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页区 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.page"
          :page-sizes="[10, 20, 50]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          class="mt-4"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
// 导入左侧导航栏组件（复用）
import Sidebar from '@/components/Sidebar.vue';
// 预留：导入接口方法
import {fetchPosts  as fetchPostsApi, batchOperatePosts, updatePostStatus, deletePost } from '../api/contentApi';

// 筛选表单
const filterForm = reactive({
  title: '',
  tagId: '',
  circleId: '',
  status: '',
  dateRange: []
});

// 分页参数
const pagination = reactive({
  page: 1,
  pageSize: 10
});

// 列表数据 + 选中项
const postList = ref([]);
const total = ref(0);
const selectedPosts = ref([]);

// 初始化加载数据
onMounted(() => {
  fetchPosts();
});

// 拉取帖子列表（预留接口调用）
const fetchPosts = async () => {
 try {
    // 组装请求参数（匹配后端接口要求）
    const params = {
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      title: filterForm.title  || undefined,
      status: filterForm.status  || undefined,
      circleId: filterForm.circleId  || undefined,
      tagId: filterForm.tagId  || undefined,
      startTime: filterForm.dateRange?.[0]?.format('yyyy-MM-dd'), // 日期格式化（如果用dayjs）
      endTime: filterForm.dateRange?.[1]?.format('yyyy-MM-dd')
    };
    const res = await fetchPostsApi(params); // 调用真实接口
    postList.value = res.data; // 后端返回的列表数据
    total.value = res.total; // 后端返回的总条数
  } catch (err) {
    ElMessage.error('获取数据失败');
  }
};

// 重置筛选
const resetFilter = () => {
  Object.assign(filterForm, {
    title: '',
    tagId: '',
    circleId: '',
    status: '',
    dateRange: []
  });
  fetchPosts();
};

// 分页事件
const handleSizeChange = (val) => {
  pagination.pageSize = val;
  fetchPosts();
};
const handleCurrentChange = (val) => {
  pagination.page = val;
  fetchPosts();
};

// 选中项变化
const handleSelectionChange = (val) => {
  selectedPosts.value = val;
};

// 批量操作（预留接口调用）
const handleBatchOperate = async (command) => {
  if (selectedPosts.value.length === 0) {
    return ElMessage.warning('请选择要操作的帖子');
  }
  const ids = selectedPosts.value.map(item => item.id);
  try {
    // 预留：真实接口调用
    await batchOperatePosts({ ids, type: command });
    ElMessage.success(`批量${command === 'delete' ? '删除' : command === 'publish' ? '发布' : '下架'}成功`);
    fetchPosts();
  } catch (err) {
    ElMessage.error('操作失败');
  }
};

// 新增/编辑/删除/状态修改
const handleAdd = () => {
  // 预留：跳转到新增页，如 router.push('/content/add')
};
const handleEdit = (row) => {
  // 预留：跳转到编辑页，如 router.push(`/content/edit/${row.id}`)
};

// 删除单个帖子
const handleDelete = async (row) => {
   try {
    await ElMessageBox.confirm('确定删除该帖子吗？', '提示', { type: 'warning' });
    await deletePost(row.id); // 调用删除接口
    ElMessage.success('删除成功');
    fetchPosts();
  } catch (err) {
    ElMessage.info('已取消删除');
  }
};
// 更新帖子状态
const handleStatusChange = async (row) => {
  const targetStatus = row.status === 'published' ? 'offline' : row.status === 'draft' ? 'published' : 'published';
  try {
    // 预留：真实接口调用
    await updatePostStatus(row.id, targetStatus);
    ElMessage.success(`操作成功`);
    fetchPosts();
  } catch (err) {
    ElMessage.error('操作失败');
  }
};
</script>

<style scoped>
/* 整体布局样式：侧边栏 + 主内容 */
.layout-container {
  display: flex;
  height: 100vh;
}

/* 主内容区样式 */
.post-manage-page {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #fff;
}

.filter-card {
  background: #f5f7fa;
}
.operate-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.total-text {
  margin-left: 20px;
  color: #666;
}
</style>