<template>
  <div class="tag-management-container">
    <!-- 左侧导航栏 -->
    <Sidebar />

    <!-- 右侧内容主区域 -->
    <div class="content-wrapper">
      <!-- 页面标题（与示例"兴趣圈子管理"风格一致） -->
      <div class="page-title">标签管理</div>

      <!-- 顶部操作栏 -->
      <div class="top-operation-bar">
        <!-- 搜索框 -->
        <el-input
          v-model="searchForm.keyword"
          placeholder="请输入标签名称搜索"
          clearable
          style="width: 240px;"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #suffix>
            <el-button size="small" type="primary" @click="handleSearch">
              搜索
            </el-button>
          </template>
        </el-input>

        <!-- 新增按钮 -->
        <el-button type="primary" icon="el-icon-plus" @click="openAddDialog">
          新增标签
        </el-button>
      </div>

      <!-- 标签列表区域 -->
      <div class="tag-list-container">
        <!-- 无数据状态 -->
        <div class="empty-state" v-if="tagList.length === 0 && !loading">
          <el-empty
            image-size="120"
            description="暂无标签数据，点击新增创建第一个标签吧～"
          ></el-empty>
        </div>

        <!-- 加载中状态 -->
        <div class="loading-state" v-if="loading">
          <el-skeleton :rows="8" animated />
        </div>

        <!-- 有数据表格 -->
        <el-table
          v-else
          :data="tagList"
          border
          stripe
          style="width: 100%;"
          highlight-current-row
        >
          <el-table-column prop="id" label="ID" width="80" align="center" />
          <el-table-column prop="name" label="标签名称" min-width="200" />
          <el-table-column
            prop="createTime"
            label="创建时间"
            width="180"
            align="center"
            :formatter="formatTime"
          />
          <el-table-column label="操作" width="280" align="center">
            <template #default="scope">
              <!-- 操作按钮组：确保删除按钮红色生效 -->
              <div class="operation-btn-group">
                <!-- 编辑按钮：蓝色文本按钮 -->
                <el-button
                  size="small"
                  type="text"
                  text-color="#409EFF"
                  @click="openEditDialog(scope.row)"
                >
                  <el-icon class="icon-mr"><Edit /></el-icon>编辑
                </el-button>

                <!-- 删除按钮：danger类型（自动红色）+ 强制红色文字 -->
                <el-button
                  size="small"
                  type="text"
                  danger
                  style="color: #F56C6C !important;"
                  @click="handleDelete(scope.row)"
                >
                  <el-icon class="icon-mr"><Delete /></el-icon>删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页区域 -->
      <div class="pagination-container">
        <!-- 分页统计 + 条数选择 -->
        <div class="pagination-left">
          <span class="total-text">共{{ total }}条</span>
          <el-select
            v-model="pagination.pageSize"
            size="small"
            style="width: 80px; margin-left: 10px;"
            @change="handleSizeChange"
          >
            <el-option label="10条/页" :value="10" />
            <el-option label="20条/页" :value="20" />
            <el-option label="50条/页" :value="50" />
          </el-select>
        </div>

        <!-- 页码按钮 + 前往输入框 -->
        <div class="pagination-right">
          <!-- 上一页 -->
          <el-button
            size="small"
            icon="el-icon-arrow-left"
            @click="handlePrevPage"
            :disabled="pagination.pageNum <= 1"
          />
          
          <!-- 页码列表 -->
          <span
            class="page-number"
            :class="{ active: pagination.pageNum === item }"
            @click="handlePageClick(item)"
            v-for="item in getPageNumbers"
            :key="item"
          >
            {{ item }}
          </span>
          
          <!-- 下一页 -->
          <el-button
            size="small"
            icon="el-icon-arrow-right"
            @click="handleNextPage"
            :disabled="pagination.pageNum >= totalPage"
          />

          <!-- 前往输入框 -->
          <span class="goto-text">前往</span>
          <el-input-number
            v-model="jumpPageNum"
            size="small"
            :min="1"
            :max="totalPage"
            style="width: 60px; margin: 0 5px;"
            @change="handleJumpPageChange"
          />
          <span class="page-text">页</span>
          <el-button
            size="small"
            type="primary"
            @click="handleJumpConfirm"
            :disabled="!jumpPageNum || jumpPageNum < 1 || jumpPageNum > totalPage"
          >
            确定
          </el-button>
        </div>
      </div>
    </div>

    <!-- 新增/编辑标签弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增标签' : '编辑标签'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="标签名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入标签名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
// 正确的图标导入
import { Search, Edit, Delete } from '@element-plus/icons-vue';
import Sidebar from '@/components/Sidebar.vue';
import { tagApi } from '@/api/tag';

// ========== 状态定义 ==========
const loading = ref(false);
const tagList = ref([]);
const total = ref(0);

// 分页配置（响应式）
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
});

// 跳转页码（独立绑定输入框）
const jumpPageNum = ref(1);

// 搜索表单
const searchForm = reactive({
  keyword: '',
});

// 总页数计算
const totalPage = computed(() => Math.ceil(total.value / pagination.pageSize) || 1);

// 动态页码列表
const getPageNumbers = computed(() => {
  const pages = [];
  const maxShow = 5;
  const total = totalPage.value;
  const current = pagination.pageNum;

  if (total <= maxShow) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (current <= 3) {
      pages.push(1, 2, 3, 4, 5);
    } else if (current >= total - 2) {
      pages.push(total - 4, total - 3, total - 2, total - 1, total);
    } else {
      pages.push(current - 2, current - 1, current, current + 1, current + 2);
    }
  }
  return pages;
});

// 弹窗相关
const dialogVisible = ref(false);
const dialogType = ref('add');
const formRef = ref(null);
const formData = reactive({
  id: '',
  name: '',
});

// 表单校验规则
const formRules = reactive({
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 50, message: '标签名称长度在1-50个字符', trigger: 'blur' },
  ],
});

// ========== 工具方法 ==========
// 时间格式化
const formatTime = (row) => {
  if (!row.createTime) return '-';
  const date = new Date(row.createTime);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
};

// ========== 核心方法 ==========
// 获取标签列表（★★★ 主要修改这里 ★★★）
const fetchTagList = async () => {
  try {
    loading.value = true;
    const params = {
      // 改动1：参数名从 keyword → name（匹配后端分页接口的参数名）
      name: searchForm.keyword.trim(),
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
    };
    // 调用后端分页接口（tagApi.getTagList 需确保指向你的后端分页接口 /api/v1/tag/page）
    const res = await tagApi.getTagList(params);
    tagList.value = res.data || [];
    // 改动2：总条数从 res.count → res.total（匹配后端分页接口的返回字段）
    total.value = res.total || 0;
    jumpPageNum.value = pagination.pageNum;
  } catch (error) {
    console.error('获取标签列表失败：', error);
    tagList.value = [];
    total.value = 0;
    ElMessage.error('获取标签列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 搜索功能
const handleSearch = () => {
  pagination.pageNum = 1;
  fetchTagList();
};

// 条数切换
const handleSizeChange = (val) => {
  pagination.pageSize = val;
  pagination.pageNum = 1;
  fetchTagList();
};

// 上一页
const handlePrevPage = () => {
  if (pagination.pageNum > 1) {
    pagination.pageNum--;
    fetchTagList();
  }
};

// 下一页
const handleNextPage = () => {
  if (pagination.pageNum < totalPage.value) {
    pagination.pageNum++;
    fetchTagList();
  }
};

// 点击页码
const handlePageClick = (page) => {
  pagination.pageNum = page;
  fetchTagList();
};

// 跳转页码输入框变化
const handleJumpPageChange = (val) => {
  jumpPageNum.value = val;
};

// 跳转页码确认
const handleJumpConfirm = () => {
  if (jumpPageNum.value >= 1 && jumpPageNum.value <= totalPage.value) {
    pagination.pageNum = jumpPageNum.value;
    fetchTagList();
  } else {
    ElMessage.warning('页码超出范围');
  }
};

// 打开新增弹窗
const openAddDialog = () => {
  dialogType.value = 'add';
  formRef.value?.resetFields();
  Object.assign(formData, { id: '', name: '' });
  dialogVisible.value = true;
};

// 打开编辑弹窗
const openEditDialog = (row) => {
  dialogType.value = 'edit';
  Object.assign(formData, {
    id: row.id,
    name: row.name,
  });
  dialogVisible.value = true;
};

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value.validate();
    let res;
    if (dialogType.value === 'add') {
      res = await tagApi.addTag({
        name: formData.name.trim()
      });
    } else {
      res = await tagApi.editTag({
        id: formData.id,
        name: formData.name.trim()
      });
    }
    ElMessage.success(dialogType.value === 'add' ? '新增标签成功' : '编辑标签成功');
    dialogVisible.value = false;
    // 提交后重新拉取分页列表
    fetchTagList();
  } catch (error) {
    if (error.name !== 'ValidationError') {
      console.error('提交标签失败：', error);
      ElMessage.error(dialogType.value === 'add' ? '新增标签失败' : '编辑标签失败');
    }
  }
};

// 删除标签
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该标签吗？删除后不可恢复！',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    await tagApi.deleteTag(row.id);
    ElMessage.success('删除标签成功');
    // 删除后重新拉取分页列表
    fetchTagList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除标签失败：', error);
      ElMessage.error('删除标签失败');
    }
  }
};

// ========== 监听与生命周期 ==========
watch(totalPage, (newVal) => {
  if (jumpPageNum.value > newVal) {
    jumpPageNum.value = newVal;
  }
});

onMounted(() => {
  fetchTagList();
});
</script>

<style scoped>
/* 全局样式重置 & 基础布局 */
.tag-management-container {
  display: flex;
  height: 100vh;
  background-color: #f8f9fa;
  font-size: 14px;
  color: #333;
}

/* 右侧内容区 */
.content-wrapper {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
  box-sizing: border-box;
}

/* 页面标题（与示例风格一致） */
.page-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 24px;
}

/* 顶部操作栏 */
.top-operation-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 20px;
}

/* 标签列表容器 */
.tag-list-container {
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  min-height: 420px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f2f5;
}

/* 无数据状态 */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 420px;
}

/* 加载中状态 */
.loading-state {
  padding: 24px;
}

/* 操作按钮组：示例样式适配 */
.operation-btn-group {
  display: flex;
  gap: 18px;
  align-items: center;
}

/* 图标与文字间距 */
.icon-mr {
  margin-right: 4px;
}

/* 确保文本按钮样式不被覆盖 */
:deep(.el-button--text) {
  --el-button-hover-bg-color: transparent;
  font-size: 14px;
}
/* 强制删除按钮红色（优先级最高） */
:deep(.el-button--text.danger) {
  color: #F56C6C !important;
}
/* 编辑按钮蓝色 */
:deep(.el-button--text) {
  color: #409EFF !important;
}

/* 表格样式优化 */
:deep(.el-table) {
  --el-table-row-hover-bg-color: #f5f8ff;
  --el-table-header-text-color: #1f2937;
  --el-table-text-color: #4b5563;
}

:deep(.el-table__cell) {
  padding: 16px 0 !important;
  border-bottom: 1px solid #f0f2f5;
}

:deep(.el-table th.el-table__cell) {
  padding: 14px 0 !important;
  background-color: #f9fafb;
}

/* 分页容器 */
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  padding: 20px 24px;
  border-radius: 12px;
  gap: 24px;
  flex-wrap: wrap;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f2f5;
}

/* 分页左侧区域 */
.pagination-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 分页右侧区域 */
.pagination-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 页码样式优化 */
.page-number {
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}
.page-number:hover {
  background-color: #eff6ff;
  color: #3b82f6;
  border-color: #dbeafe;
}
.page-number.active {
  color: #fff;
  font-weight: 600;
  background-color: #3b82f6;
  border-color: #3b82f6;
}

/* 文本样式统一 */
.goto-text, .page-text {
  font-size: 14px;
  color: #6b7280;
}
.total-text {
  font-size: 14px;
  color: #4b5563;
  font-weight: 500;
}

/* 弹窗样式微调 */
:deep(.el-dialog) {
  border-radius: 12px;
}
:deep(.el-dialog__header) {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f2f5;
}
:deep(.el-dialog__body) {
  padding: 24px;
}
:deep(.el-dialog__footer) {
  padding: 16px 24px 20px;
  border-top: 1px solid #f0f2f5;
}

/* 表单样式优化 */
:deep(.el-form-item__content) {
  margin-left: 0 !important;
}
:deep(.el-input) {
  --el-input-border-radius: 6px;
  --el-input-hover-border-color: #93c5fd;
}

/* 按钮样式统一 */
:deep(.el-button) {
  --el-button-border-radius: 6px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 16px;
  }
  .top-operation-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .top-operation-bar .el-input {
    width: 100% !important;
  }
  .pagination-container {
    flex-direction: column;
    align-items: stretch;
  }
  .pagination-left, .pagination-right {
    justify-content: center;
    margin-bottom: 12px;
  }
  .pagination-right {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>