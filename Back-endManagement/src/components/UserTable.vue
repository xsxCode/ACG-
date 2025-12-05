<template>
  <div class="table-container">
    <el-table 
      :data="Array.isArray(userList) ? userList : []" 
      stripe 
      border 
      class="user-table"
      :loading="loading"
      @selection-change="handleSelectionChange"
      v-loading="loading"
      :row-key="row => row.id"
      ref="tableRef"  
    >
      <!-- 多选列 -->
      <el-table-column type="selection" width="55" align="center" :selectable="row => !row.isDeleted"  />
      
      <!-- 序号列 -->
      <el-table-column type="index" label="序号" width="80" align="center" />

      <!-- 用户名列 -->
      <el-table-column prop="username" label="用户名" width="150">
        <template #default="scope">
          <div class="user-info">
            <el-avatar 
              :src="scope.row.avatar" 
              class="avatar" 
              :alt="scope.row.username"
            >
              {{ scope.row.username.substring(0, 1) }}
            </el-avatar>
            <span class="username">{{ scope.row.username }}</span>
          </div>
        </template>
      </el-table-column>

      <!-- 手机号列 -->
      <el-table-column prop="phone" label="手机号" width="150" align="center" />

      <!-- 兴趣标签列 -->
      <el-table-column label="兴趣标签" width="200">
        <template #default="scope">
          <el-tag 
            size="small" 
            class="tag-item"
            type="info"
            effect="light"
          >
            {{ scope.row.signature || '无' }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 注册时间列：格式化时间 -->
      <el-table-column prop="createTime" label="注册时间" width="180" align="center">
        <template #default="scope">
          {{ scope.row.createTime ? new Date(scope.row.createTime).toLocaleString() : '-' }}
        </template>
      </el-table-column>

      <!-- 状态列（数字类型匹配） -->
      <el-table-column label="状态" width="100" align="center">
        <template #default="scope">
          <el-switch 
            v-model="scope.row.status" 
            :active-value="1" 
            :inactive-value="0" 
            @change="() => handleStatusChange(scope.row)" 
            active-color="#67C23A"
            inactive-color="#F56C6C"
          />
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" width="240" align="center"> <!-- 加宽避免按钮挤在一起 -->
          <template #default="scope">
              <div class="operation-group">
                <!-- 编辑按钮：主色+编辑图标 -->
                <el-button 
                  size="small" 
                  type="primary" 
                  text
                  @click="$emit('edit', scope.row)"
                  icon="Edit"
                >
                  编辑
                </el-button>

                <!-- 删除按钮：危险色+删除图标 -->
                <el-button 
                  size="small" 
                  type="danger" 
                  text
                  @click="$emit('delete', scope.row)"
                  icon="Delete"
                >
                  删除
                </el-button>

                <!-- 重置密码按钮：警告色+钥匙图标 -->
                <el-button 
                  size="small" 
                  type="warning" 
                  text
                  @click="$emit('reset-password', scope.row)"
                  icon="Key"
                >
                  重置密码
                </el-button>
              </div>
            </template>
          </el-table-column>
      </el-table>
  </div>
</template>

<script setup>
// 补充导入缺失的API
import { ref, defineProps, defineEmits, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { debounce } from 'lodash'

// 接收父组件参数
const props = defineProps({
  userList: {
    type: Array,
    required: true,
    default: () => []
  },
  selectedUsers: {
    type: Array,
    required:true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// 定义事件
const emit = defineEmits([
  'selection-change', 
  'edit', 
  'delete', 
  'reset-password',
  'status-change'
])

// 定义表格Ref（模板中已绑定）
const tableRef = ref(null);

// 监听selectedUsers变化，同步表格选中状态（避免内部数据不一致）
watch(
  () => props.selectedUsers,
  (newVal) => {
    if (tableRef.value && Array.isArray(newVal)) {
      // 清空现有选中
      tableRef.value.clearSelection();
      // 重新选中指定行（通过row-key匹配，更可靠）
      newVal.forEach(row => {
        tableRef.value.toggleRowSelection(row, true);
      });
    }
  },
  { immediate: true, deep: true }
);

// 多选事件传递
const handleSelectionChange = (val) => {
  emit('selection-change', val)
}

// 状态切换（防抖+增加提示反馈）
const handleStatusChange = debounce((user) => {
  emit('status-change', user)
  ElMessage.info(`用户${user.status === 1 ? '启用' : '禁用'}中...`)
}, 300)
</script>

<style scoped>
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.avatar {
  width: 30px;
  height: 30px;
}
.tag-item {
  margin-right: 4px;
  background-color: #f0f2f5;
  color: #4096ff;
}
.table-container {
  width: 100%;
}
/* 优化操作按钮间距 */
.operation-group {
  display: flex;
  gap: 4px; /* 按钮之间加间距 */
  justify-content: center;
}
/* 修复小屏幕下标签换行问题 */
.tag-item {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}
</style>