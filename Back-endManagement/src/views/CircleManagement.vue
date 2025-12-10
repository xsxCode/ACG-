<template>
  <el-container class="page-container">
    <el-aside width="220px" class="sidebar-container">
      <Sidebar />
    </el-aside>

    <el-main class="main-content">
      <div class="page-title">兴趣圈子管理</div>

      <!-- 筛选条件区域 -->
      <el-card shadow="hover" class="filter-card">
        <el-form :model="searchForm" label-width="80px">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="圈子名称">
                <el-input placeholder="请输入圈子名称搜索" v-model="searchForm.name" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="状态">
                <el-select placeholder="请选择状态" v-model="searchForm.status" clearable>
                  <el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="创建时间">
                <el-date-picker
                  v-model="searchForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <div class="filter-btn-group">
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </div>
        </el-form>
      </el-card>

      <!-- 圈子表格区域 -->
      <el-card shadow="hover" class="content-card">
        <div class="table-header">
          <span>圈子列表</span>
          <el-button type="primary" icon="Plus" @click="openCreateDialog">新增圈子</el-button>
        </div>
        
        <el-table 
          :data="tableData" 
          border 
          stripe 
          :header-cell-style="{ background: '#f5f7fa' }"
          :loading="isTableLoading"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="name" label="圈子名称" min-width="180">
            <template #default="scope">
              <span class="title-link">{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="founder" label="创建人" width="120" align="center" />
          <el-table-column prop="memberCount" label="成员数" width="100" align="center" />
          <el-table-column prop="status" label="状态" width="120" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
                {{ scope.row.status === 'active' ? '活跃' : '非活跃' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="160" align="center" />
          <el-table-column label="操作" width="220" align="center">
            <template #default="scope">
              <el-button type="text" icon="Edit" @click="openEditDialog(scope.row.id)">编辑</el-button>
              <el-button type="text" icon="Delete" @click="handleDelete(scope.row.id)" class="text-danger">删除</el-button>
              <el-button type="text" icon="User" @click="viewMembers(scope.row.id)">成员</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页组件 -->
        <div class="pagination">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next"
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </el-main>
  </el-container>

  <!-- 新增/编辑圈子对话框 -->
  <el-dialog 
    :title="isEditMode ? '编辑圈子' : '新增圈子'" 
    v-model="isDialogOpen"
    width="600px"
    :before-close="handleDialogClose"
  >
    <el-form 
      :model="formData" 
      :rules="formRules" 
      ref="formRef"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="圈子名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入圈子名称" />
      </el-form-item>
      <el-form-item label="圈子描述" prop="description">
        <el-input 
          v-model="formData.description" 
          type="textarea" 
          rows="5" 
          placeholder="请输入圈子描述"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择圈子状态">
          <el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="isSubmitting">
          {{ isEditMode ? '更新' : '创建' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import Sidebar from '../components/Sidebar.vue';
import * as circleApi from '../api/circleApi.js';

// --- 表格和分页状态 ---
const tableData = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const isTableLoading = ref(false);

// --- 搜索表单状态 ---
const searchForm = reactive({
  name: '',
  status: '',
  dateRange: [],
});

// --- 状态选项 ---
const statuses = ref(circleApi.statuses);

// --- 对话框和表单状态 ---
const isDialogOpen = ref(false);
const isEditMode = ref(false);
const formRef = ref(null);
const formData = reactive({
  name: '',
  description: '',
  status: 'active', // 默认状态为活跃
});
const formRules = ref({
  name: [{ required: true, message: '请输入圈子名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入圈子描述', trigger: 'blur' }],
});
const isSubmitting = ref(false);
const currentCircleId = ref(null);

// --- 生命周期钩子 ---
onMounted(() => {
  fetchCircleList();
});

// --- 事件处理函数 ---

// 获取圈子列表
const fetchCircleList = async () => {
  isTableLoading.value = true;
  try {
    const params = {
      name: searchForm.name,
      // 后端没返回status，暂时注释status筛选
      // status: searchForm.status,
      dateRange: searchForm.dateRange,
      page: currentPage.value,
      pageSize: pageSize.value,
    };
    
    const response = await circleApi.fetchCircles(params);
    console.log('后端返回原始数据：', response); // 验证数据是否拿到
    // 核心：字段映射（后端字段 → 前端表格字段）
    tableData.value = response.circles.map(item => ({
      id: item.id,
      name: item.name || '', // 圈子名称（匹配）
      founder: item.creator_id || '未知', // 后端是creator_id → 前端founder
      memberCount: item.member_count || 0, // 后端member_count → 前端memberCount
      status: 'active', // 后端没返回status，先给默认值（后续让后端补充）
      createTime: item.create_time || '' // 后端create_time → 前端createTime
    }));
    total.value = response.total; // 总数映射
  } catch (error) {
    ElMessage.error('获取圈子列表失败: ' + error.message);
  } finally {
    isTableLoading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchCircleList();
};

// 重置搜索
const resetSearch = () => {
  searchForm.name = '';
  searchForm.status = '';
  searchForm.dateRange = [];
  handleSearch();
};

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchCircleList();
};

// 当前页码改变
const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchCircleList();
};

// 打开创建对话框
const openCreateDialog = () => {
  isEditMode.value = false;
  formRef.value?.clearValidate();
  formData.name = '';
  formData.description = '';
  formData.status = 'active';
  currentCircleId.value = null;
  isDialogOpen.value = true;
};

// 打开编辑对话框
const openEditDialog = async (id) => {
  isEditMode.value = true;
  currentCircleId.value = id;
  
  isTableLoading.value = true;
  try {
    const circle = await circleApi.fetchCircleById(id);
    if (circle) {
      formData.name = circle.name;
      formData.description = circle.description;
      formData.status = circle.status;
      isDialogOpen.value = true;
    } else {
      ElMessage.warning('未找到该圈子');
    }
  } catch (error) {
    ElMessage.error('加载圈子详情失败: ' + error.message);
  } finally {
    isTableLoading.value = false;
  }
};

// 关闭对话框
const handleDialogClose = () => {
  isDialogOpen.value = false;
  setTimeout(() => {
    formRef.value?.clearValidate();
  }, 300);
};

// 提交表单 (创建或更新)
const submitForm = async () => {
  await formRef.value?.validate();
  
  isSubmitting.value = true;
  try {
    if (isEditMode.value && currentCircleId.value) {
      await circleApi.updateCircle(currentCircleId.value, {
        name: formData.name,
        description: formData.description,
        status: formData.status,
      });
      ElMessage.success('圈子更新成功');
    } else {
      await circleApi.createCircle({
        name: formData.name,
        description: formData.description,
        status: formData.status,
      });
      ElMessage.success('圈子创建成功');
    }
    
    isDialogOpen.value = false;
    fetchCircleList();
  } catch (error) {
    ElMessage.error(`${isEditMode.value ? '更新' : '创建'}圈子失败: ` + error.message);
  } finally {
    isSubmitting.value = false;
  }
};

// 删除圈子
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除该圈子, 是否继续?',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    const success = await circleApi.deleteCircle(id);
    if (success) {
      ElMessage.success('圈子删除成功');
      fetchCircleList();
    } else {
      ElMessage.warning('删除失败，圈子可能已不存在');
    }
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('已取消删除');
      return;
    }
    ElMessage.error('删除圈子失败: ' + error.message);
  }
};

// 查看成员 (模拟)
const viewMembers = (id) => {
  ElMessage.info(`查看圈子 ID: ${id} 的成员列表`);
  // 在真实项目中，这里会跳转到成员管理页面或打开一个成员列表的对话框
};

</script>

<style scoped>
/* 样式与 content-management.vue 保持一致 */
.page-container { height: 100vh; display: flex; }
.sidebar-container { background-color: #0f172a; }
.main-content { padding: 20px; background-color: #f5f7fa; overflow-y: auto; }
.page-title { font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #333; }
.filter-card { margin-bottom: 20px; padding: 15px; }
.filter-btn-group { text-align: right; margin-top: 15px; }
.content-card { padding: 0; }
.table-header { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #ebeef5; }
.title-link { color: #409eff; cursor: pointer; }
.title-link:hover { text-decoration: underline; }
.pagination { display: flex; justify-content: flex-end; margin-top: 15px; padding: 0 15px 15px; }
.text-danger { color: #f56c6c; }
</style>