<template>
  <div class="table-container">
    <!-- 用户表格 -->
    <el-table :data="userList" stripe border class="user-table">
      
      <!-- 序号列 -->
      <el-table-column type="index" label="序号" width="80" />

      <!-- 用户名列 -->
      <el-table-column prop="username" label="用户名" width="150">
        <template #default="scope">
          <div class="user-info">
            <!-- 用户头像 -->
            <el-avatar 
              :src="scope.row.avatar " 
              class="avatar" 
            />
            <span class="username">{{ scope.row.username }}</span>
          </div>
        </template>
      </el-table-column>

      <!-- 手机号列 -->
      <el-table-column prop="phone" label="手机号" width="150" />

      <!-- 兴趣标签列 -->
      <el-table-column prop="tags" label="兴趣标签" width="200">
        <template #default="scope">
          <!-- 循环显示标签 -->
          <el-tag 
            v-for="tag in scope.row.tags.split(',')" 
            :key="tag" 
            size="small" 
            class="tag-item"
          >
            {{ tag }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 注册时间列 -->
      <el-table-column prop="create_time" label="注册时间" width="180" />

      <!-- 状态列 -->
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <!-- 状态开关 -->
          <el-switch 
            v-model="scope.row.status" 
            active-value="1" 
            inactive-value="0" 
            @change="handleStatusChange(scope.row)" 
          />
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <<!-- 表格操作列按钮：用自定义样式替代 type 属性 -->
<el-table-column label="操作" width="200">
  <template #default="scope">
    <!-- 编辑按钮：自定义文本样式 -->
    <el-button 
      size="small" 
      style="background: transparent; border: none; color: #409eff; padding: 0 8px;"
      @click="$emit('edit', scope.row)"
    >
      编辑
    </el-button>

    <!-- 删除按钮：自定义红色文本样式 -->
    <el-button 
      size="small" 
      style="background: transparent; border: none; color: #f56c6c; padding: 0 8px;"
      @click="$emit('delete', scope.row)"
    >
      删除
    </el-button>

    <!-- 重置密码按钮：自定义文本样式 -->
    <el-button 
      size="small" 
      style="background: transparent; border: none; color: #409eff; padding: 0 8px;"
      @click="$emit('reset-password', scope.row)"
    >
      重置密码
    </el-button>
  </template>
</el-table-column>
    </el-table>

    <!-- 分页控件 -->
    <!-- <div class="pagination-container">
      <el-pagination 
        v-model:current-page="currentPage" 
        v-model:page-size="pageSize" 
        :page-sizes="[10, 20, 50]" 
        :total="total" 
        layout="total, sizes, prev, pager, next, jumper" 
        @size-change="handleSizeChange" 
        @current-change="handleCurrentChange" 
      />
    </div> -->
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
// import { ElMessage } from 'element-plus'
import { debounce } from 'lodash'

// 接收父组件传递的用户列表数据
const props = defineProps({
  userList: {
    type: Array,
    required: true
  }
})

// 定义发送给父组件的事件
const emit = defineEmits(['edit', 'delete'])

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(props.userList.length)

// 状态切换处理
const handleStatusChange = debounce(
  async (user) => {
    try {
      // 这里应该调用API更新状态
      console.log('更新用户状态:', user.id, user.status)
      ElMessage.success('状态更新成功')
    } catch (error) {
      // 如果出错，恢复原来的状态
      user.status = user.status === '1' ? '0' : '1'
      ElMessage.error('状态更新失败')
    }
  },300
)   

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val
  // 这里可以通知父组件重新获取数据
}

// 当前页码改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  // 这里可以通知父组件重新获取数据
}
</script>

<style scoped>
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;  /* 头像和文字之间的间距 */
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

.edit-btn {
  color: #4096ff;
}

.delete-btn {
  color: #f56c6c;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>