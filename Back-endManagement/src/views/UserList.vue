<template>
  <el-container style="height: 100vh;">
    <el-aside width="200px" style="background: #0f172a;">
      <Sidebar />
    </el-aside>
    <el-container>
      <el-header style="padding: 0 20px; border-bottom: 1px solid #e5e7eb;background: white;">
        <div class="header-content">
          <h2 style="margin: 0;">用户管理</h2>
          <div class="header-actions">
            <el-button type="primary" @click="addUser" size="default">
              <el-icon><Plus/></el-icon>
              添加用户
            </el-button>
            <el-button @click="exportData" size="default">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
          </div>
        </div>
      </el-header>
      <el-main style="background: #f5f7fa;padding: 20px;">
        <!-- 搜索区域：紧凑样式优化 -->
        <el-card style="margin-bottom: 20px; border-radius: 8px;">
          <div class="search-toolbar">
            <el-input 
              v-model="searchParams.keyword"
              placeholder="搜索用户名/手机号/邮箱"
              style="width: 280px;"
              prefix-icon="Search"
              clearable
              @input="debouncedSearch"
              @keyup.enter="handleSearch"
              size="small"
            />
            <el-select 
              v-model="searchParams.status" 
              placeholder="状态" 
              clearable
              @change="handleSearch"
              style="width: 120px;"
              size="small"
            >
              <el-option label="全部" value="" /> <!-- 新增“全部”选项 -->
              <el-option label="正常" value="1"></el-option>
              <el-option label="禁用" value="0"></el-option>
            </el-select>
            <el-button 
              type="primary" 
              @click="handleSearch" 
              :loading="loading"
              size="small"
              icon="Search"
            >
              搜索
            </el-button>
            <el-button 
              @click="resetSearch"
              size="small"
              icon="Refresh"
            >
              重置
            </el-button>
          </div>
        </el-card>

        <el-card style="border-radius: 8px;">
          <div class="batch-actions" v-if="selectedUsers.length >0">
            <span>已选择{{ selectedUsers.length }}条数据</span>
            <el-button type="danger" size="small" @click="batchDelete">批量删除</el-button>
            <el-button type="success" size="small" @click="batchEnable">批量启用</el-button>
            <el-button type="warning" size="small" @click="batchDisable">批量禁用</el-button>
          </div>
          
          <!-- 补充key确保列表更新时正确渲染 -->
          <UserTable 
            :user-list="userList || []"
            :selected-users="selectedUsers"
            :loading="loading"
            @selection-change="handleSelectionChange"
            @edit="handleEdit"
            @delete="handleDelete"
            @reset-password="handleResetPassword"
            @status-change="handleStatusChange"
            :key="`user-table-${pagination.currentPage}-${pagination.pageSize}`"
          /> 
          
          <div class="pagination-container">
            <el-pagination 
              @size-change="handleSizeChange"  
              @current-change="handleCurrentChange"  
              v-model:page-size="pagination.pageSize"
              v-model:current-page="pagination.currentPage" 
              :page-sizes="[5, 10, 20, 50]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              :disabled="loading"
              size="small"
            />
          </div>
        </el-card>

        <UserDialog
          v-model="dialog.visible"
          :user-data="dialog.userData"
          :mode="dialog.mode"
          @update:visible="dialog.visible = $event"
          @confirm="handleDialogConfirm"
        />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Download, Search, Refresh } from '@element-plus/icons-vue';
import Sidebar from '../components/Sidebar.vue';
import UserTable from '../components/UserTable.vue';
import UserDialog from '../components/UserDialog.vue';
import * as userApi from '../api/userApi.js';
import { debounce } from 'lodash';

// 搜索参数：status初始化为undefined，避免空字符串转数字异常
const searchParams = reactive({
  keyword: '',
  status: '',// 改为空字符串，和“全部”选项的value一致
});

// 分页参数
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
  pages: 1 // 后端返回的总页数，可选
});

// 对话框状态
const dialog = reactive({
  visible: false,
  mode: 'add',
  userData: null
});

// 状态管理
const loading = ref(false);
const selectedUsers = ref([]);
const userList = ref([]);

/**
 * 获取用户列表（根据是否有搜索关键词，调用不同接口）
 * 逻辑：关键词为空 → 调用分页接口；关键词非空 → 调用搜索接口
 */
const fetchUsers = async () => {
  loading.value = true;
  try {
    let res;
    const keyword = searchParams.keyword.trim();
    const paginationParams = {
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize,
      // 修复：仅当status有值时才转数字，否则不传该参数
      status: searchParams.status !== '' ? Number(searchParams.status) : undefined
    };

    if (keyword) {
      // 搜索接口：传关键词+分页+状态
      const searchParamsObj = {
        ...paginationParams,
        ...(/^1[3-9]\d{9}$/.test(keyword) 
          ? { phone: keyword }
          : /^[\w-]+@([\w-]+\.)+[\w-]+$/.test(keyword)
            ? { email: keyword }
            : { username: keyword }
        )
      };
      res = await userApi.searchUsers(searchParamsObj);
    } else {
      // 分页接口：传分页+状态
      res = await userApi.fetchUserList(paginationParams);
    }

    // 接口返回结构：{total:7, data:[...], pages:1, pageNum:1}
    userList.value = Array.isArray(res.data) ? res.data : []; 
    pagination.total = res.total || 0;
    pagination.pages = res.pages || 1;

    // 调试日志（可选保留）
    console.log('用户列表数据：', userList.value);
  } catch (error) {
    console.error('用户查询失败:', error);
    userList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
    console.log('加载状态已关闭：', loading.value); // 新增日志，看控制台是否打印
  }
};

/**
 * 防抖搜索函数（延迟300ms执行，避免频繁请求）
 */
const debouncedSearch = debounce(() => {
  pagination.currentPage = 1;
  fetchUsers();
}, 300);

// 组件挂载时加载数据
onMounted(() => {
  fetchUsers();
});

// 手动搜索
const handleSearch = () => {
  pagination.currentPage = 1;
  fetchUsers();
};

// 重置搜索
const resetSearch = () => {
  searchParams.keyword = '';
  searchParams.status = ''; // 重置为全部
  pagination.currentPage = 1;
  fetchUsers();
};

// 分页事件：简化逻辑，移除重复判断
const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.currentPage = 1;
  fetchUsers();
};

const handleCurrentChange = (page) => {
  pagination.currentPage = page;
  fetchUsers();
};

// 添加用户
const addUser = () => {
  dialog.mode = 'add';
  dialog.userData = null;
  dialog.visible = true;
};

// 编辑用户
const handleEdit = (user) => {
  dialog.mode = 'edit';
  dialog.userData = { ...user }; // 深拷贝避免原数据被修改
  dialog.visible = true;
};

/**
 * 对话框确认操作（添加/编辑用户）
 */
const handleDialogConfirm = async (userData) => {
  console.log('子组件传过来的userData：', userData); // 打印看是否有id！
  alert(userData.id);
  
  // 处理参数：类型转换+字段映射
  const submitData = {
    id: userData.id, // 编辑时必须传id
    username: userData.username,
    phone: userData.phone,
    email: userData.email,
    status: Number(userData.status), // 字符串转数字
    role: Number(userData.role), // 字符串转数字
    signature: userData.tags || '这个人很懒，什么都没写~' // tags映射到signature
    // 编辑时不传递password，避免覆盖原有密码
  };

  // 打印处理后的参数（方便调试）
  console.log('提交给后端的参数：', submitData);
  
  try {
    if (dialog.mode === 'add') {
      await userApi.addUser({ ...submitData, password: userData.password }); // 传处理后的参数
      ElMessage.success('用户添加成功！');
    } else {
      await userApi.updateUser(submitData); // 编辑同理
      ElMessage.success('用户编辑成功！');
    }
    dialog.visible = false;
    fetchUsers();
  } catch (error) {
    let msg = dialog.mode === 'add' ? '添加' : '编辑';
    msg += '失败：';
    // 捕获唯一约束错误（用户名/手机号/邮箱重复）
    if (error.message?.includes('uk_username')) msg += '用户名已存在';
    else if (error.message?.includes('uk_phone')) msg += '手机号已被注册';
    else if (error.message?.includes('uk_email')) msg += '邮箱已被注册';
    else msg += error.message || '接口请求错误';
    ElMessage.error(msg);
  }
};

// 删除用户
const handleDelete = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定删除用户 "${user.username}" 吗？`,
      '警告',
      { type: 'warning' }
    );
    await userApi.deleteUser(user.id);
    ElMessage.success('删除成功');
    fetchUsers();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败：', error);
      ElMessage.error('删除失败');
    }
  }
};

// 批量删除
const batchDelete = async () => {
  if (selectedUsers.value.length === 0) return;
  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${selectedUsers.value.length} 条数据吗？`,
      '警告',
      { type: 'warning' }
    );
    const ids = selectedUsers.value.map(user => user.id);
    await userApi.batchDeleteUsers(ids);
    ElMessage.success('批量删除成功');
    selectedUsers.value = [];
    fetchUsers();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败：', error);
      ElMessage.error('批量删除失败');
    }
  }
};

// 批量状态更新
const batchEnable = async () => {
  await batchUpdateStatus(1, '启用');
};

const batchDisable = async () => {
  await batchUpdateStatus(0, '禁用');
};

const batchUpdateStatus = async (status, statusText) => {
  if (selectedUsers.value.length === 0) return;
  try {
    const ids = selectedUsers.value.map(user => user.id);
    await userApi.batchUpdateStatus(ids, status);
    ElMessage.success(`批量${statusText}成功`);
    selectedUsers.value = [];
    fetchUsers();
  } catch (error) {
    console.error(`批量${statusText}失败：`, error);
    ElMessage.error(`批量${statusText}失败`);
  }
};

/**
 * 单个用户状态修改（启用/禁用）
 */
const handleStatusChange = async (user) => {
  const originalStatus = user.status;
  try {
    await userApi.updateUserStatus(user.id, user.status);
    ElMessage.success(`状态更新为：${user.status === 1 ? '启用' : '禁用'}`);
  } catch (error) {
    // 回滚状态：确保视图与后端一致
    const index = userList.value.findIndex(u => u.id === user.id);
    if (index !== -1) {
      userList.value[index].status = originalStatus;
    }
    ElMessage.error(`状态更新失败：${error.message || '接口请求错误'}`);
  }
};

// 重置密码
const handleResetPassword = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定重置用户 "${user.username}" 的密码吗？`,
      '重置密码'
    );
    await userApi.resetUserPassword(user.id);
    ElMessage.success('密码重置成功');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置密码失败：', error);
      ElMessage.error('重置密码失败');
    }
  }
};

// 导出数据
const exportData = () => {
  ElMessage.info('导出功能开发中...');
};

// 选中变化：确保始终是数组
const handleSelectionChange = (val) => {
  selectedUsers.value = val || [];
};
</script>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* 搜索区域样式优化 */
.search-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
}

/* 统一输入框/下拉框样式 */
:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  border-radius: 4px;
  box-shadow: none;
}

:deep(.el-input--small .el-input__wrapper),
:deep(.el-select--small .el-select__wrapper) {
  height: 32px;
}

.batch-actions {
  padding: 10px 0;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

/* 卡片圆角优化 */
:deep(.el-card) {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}
</style>