<template>
  <div class="tag-management-container">
    <!-- 左侧导航栏 -->
    <Sidebar />

    <!-- 右侧内容主区域 -->
    <div class="content-wrapper">
      <!-- 顶部操作栏 -->
      <div class="top-operation-bar">
        <!-- 搜索框（新增搜索按钮，确保搜索触发） -->
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
          />
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
          <el-table-column label="操作" width="180" align="center">
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                icon="el-icon-edit"
                @click="openEditDialog(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                type="danger"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页区域（修复分页逻辑） -->
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

          <!-- 前往输入框（修复联动） -->
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
import { Search } from '@element-plus/icons-vue';
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
// 获取标签列表（核心：传递所有查询参数）
const fetchTagList = async () => {
  try {
    loading.value = true;
    // 构建完整的查询参数
    const params = {
      keyword: searchForm.keyword.trim(),
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
    };
    console.log('请求参数：', params); // 调试用，可删除
    
    const res = await tagApi.getTagList(params);
    
    // 适配后端返回格式
    tagList.value = res.data || [];
    total.value = res.count || 0;
    
    // 同步跳转页码输入框
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

// 搜索功能（重置页码为1）
const handleSearch = () => {
  pagination.pageNum = 1; // 搜索时回到第一页
  fetchTagList();
};

// 条数切换
const handleSizeChange = (val) => {
  pagination.pageSize = val;
  pagination.pageNum = 1; // 切换条数回到第一页
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
    fetchTagList(); // 提交后刷新列表
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
    fetchTagList(); // 删除后刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除标签失败：', error);
      ElMessage.error('删除标签失败');
    }
  }
};

// ========== 监听与生命周期 ==========
// 监听总页数变化，修正跳转页码范围
watch(totalPage, (newVal) => {
  if (jumpPageNum.value > newVal) {
    jumpPageNum.value = newVal;
  }
});

// 监听分页参数变化（可选，自动刷新）
watch([() => pagination.pageNum, () => pagination.pageSize], () => {
  // 防止重复请求，可根据需要开启
  // fetchTagList();
});

// 页面加载时初始化
onMounted(() => {
  fetchTagList();
});
</script>

<style scoped>
/* 样式部分保持不变 */
.tag-management-container {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

.content-wrapper {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  box-sizing: border-box;
}

.top-operation-bar {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 20px;
  gap: 16px;
}

.tag-list-container {
  background-color: #fff;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 20px;
  min-height: 400px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.loading-state {
  padding: 20px;
}

.pagination-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: #fff;
  padding: 16px;
  border-radius: 4px;
  gap: 20px;
  flex-wrap: wrap;
}

.pagination-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-number {
  padding: 2px 8px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
}

.page-number.active {
  color: #1989fa;
  font-weight: bold;
  background-color: #f5f7fa;
}

.goto-text, .page-text, .total-text {
  font-size: 14px;
  color: #666;
}

@media (max-width: 768px) {
  .pagination-container {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>