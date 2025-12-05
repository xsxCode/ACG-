<template >
    <el-container style="height: 100vh;">
        <!-- 侧边栏 -->
        <el-aside width="200px" style="background: #0f172a;">
            <Sidebar />
        </el-aside>

        <!-- 主内容区 -->
        <el-container>
            <!-- 顶部操作栏 -->
             <el-header style="padding: 0 20px; border-bottom: 1px solid #e5e7eb;background: white;">
                <div class="header-content">
                    <h2 style="margin: 0;">用户管理</h2>
                    <div class="header-actions">
                        <el-button type="primary" @click="addUser">
                            <el-icon><Plus/></el-icon>
                            添加用户
                        </el-button>
                        <el-button @click="exportData">
                            <el-icon><Download /></el-icon>
                            导出数据
                        </el-button>
                    </div>
                </div>
             </el-header>
             <!-- 搜索和筛选区域 -->
              <el-main style="background: #f5f7fa;padding: 20px;">
                <!-- 搜索卡片 -->
                <el-card style="margin-bottom: 20px;">
                    <div class="search-toolbar">
                        <!-- 关键词索 -->
                        <el-input 
                            v-model="searchParams.keyword"
                            placeholder="搜索用户名/手机号/邮箱/标签"
                            style="width: 300px;"
                            prefix-icon="Search"
                            clearble
                            @keyup.enter="handleSearch"
                        />

                        <!-- 状态筛选 -->
                        <el-select v-model="searchParams.status" placeholder="筛选" clearabel>
                            <el-option label="正常" value="1"></el-option>
                            <el-option label="禁用" value="0"></el-option>
                        </el-select>

                        <!-- 搜索按钮 -->
                         <el-button type="primary" @click="handleSearch">
                            <el-icon><Search /></el-icon>
                            搜索
                         </el-button>

                         <el-button @click="resetSearch">
                            <el-icon><Refresh /></el-icon>
                         </el-button>
                    </div>
                </el-card>
                <!-- 用户表格 -->
                <el-card>
                    <!-- 批量操作栏 -->
                    <div class="batch-actions" v-if="selectedUsers.length >0">
                        <span>已选择{{ selectedUsers.length }}</span>
                        <el-button type="danger" size="small" @click="batchDelete">批量删除</el-button>
                        <el-button type="success" size="small" @click="batchEnable">批量启用</el-button>
                        <el-button type="warning" size="small" @click="batchDisable">批量禁用</el-button>
                    </div>

                    <UserTable 
                        :user-list="displayUsers"
                        :selected-users="selectedUsers"
                        @selection-change="handleSelectionChange"
                        @edit="handleEdit"
                        @delete="handleDelete"
                        @status-change="handleResetPassword"
                        @reset-password="handleResetPassword"
                    /> 

                    <!-- 分页 -->
                     <div class="pagination-container">
                        <el-pagination 
                            @size-change="handleSizeChange"  
                            @current-change="handleCurrentChange"  
                            v-model:page-size="pagination.pageSize"
                            v-model:current-page="pagination.currentPage" 
                            :current-page="pagination.currentPage"
                            :page-sizes="[5, 10, 20, 50]"
                            :page-size="pagination.pageSize"
                            :total="pagination.total"
                            layout="total, sizes, prev, pager, next, jumper"
                        />
                     </div>

                     <!-- 添加/编辑用户对话框 -->
                     <UserDialog
                        v-model="dialog.visible"
                        :user-data="dialog.userData"
                        :mode="dialog.mode"
                        @update:visible="dialog.visible = $event"
                        @confirm="handleDialogConfirm"
                      />
                </el-card>

              </el-main>
        </el-container>
    </el-container>
</template>
<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
// import { ElMessage, ElMessageBox } from 'element-plus'
import Sidebar from '../components/Sidebar.vue'
import UserTable from '../components/UserTable.vue'
import UserDialog from '../components/UserDialog.vue'


//
const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}
const handleResetPassword = (user) => {
  ElMessageBox.confirm(`确定重置用户 "${user.username}" 的密码吗？`, '重置密码').then(() => {
    ElMessage.success('密码重置成功，新密码已发送到用户邮箱')
  })
}

// 搜索参数
const searchParams = reactive({
  keyword: '', // 搜索关键词（空字符串表示初始没内容）
  status: '' // 状态筛选（空表示没选择）
})

// 分页参数
const pagination = reactive({
  currentPage: 1, // 当前页码（默认第1页）
  pageSize: 10, // 每页显示10条
  total: 0 // 总条数（初始0，后面会计算）
})

// 对话框状态
const dialog = reactive({
  visible: false, // 弹窗是否显示（默认不显示）
  mode: 'add', // 模式：默认是添加
  userData: null // 用户数据：添加时是空，编辑时是要改的用户
})

// 选中的用户
const selectedUsers = ref([]) // 用ref定义的数组，存选中的用户

// 模拟用户数据（像假的数据库）
const allUsers = ref([
  {
    id: 1,
    username: 'ACG爱好者',
    phone: '13800138001',
    email: 'acg@qq.com',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    tags: '原神,cosplay,咒术回战',
    status: 1,
    create_time: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    username: '动漫达人',
    phone: '13800138002',
    email: 'anime@qq.com',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    tags: '火影忍者,海贼王,进击的巨人',
    status: 1,
    create_time: '2024-01-20 09:15:00'
  },
  {
    id: 3,
    username: '游戏玩家',
    phone: '13800138003',
    email: 'game@qq.com',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    tags: '英雄联盟,原神,王者荣耀',
    status: 0,
    create_time: '2024-02-01 14:20:00'
  },
  {
    id: 4,
    username: '二次元萌新',
    phone: '13800138004',
    email: 'moe@qq.com',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    tags: '初音未来,lovelive,轻音少女',
    status: 1,
    create_time: '2024-02-05 16:45:00'
  },
  {
    id: 5,
    username: 'Cosplay大师',
    phone: '13800138005',
    email: 'coser@qq.com',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    tags: 'cosplay,摄影,妆造',
    status: 1,
    create_time: '2024-02-10 11:20:00'
  },
  {
    id: 6,
    username: '漫画收藏家',
    phone: '13800138006',
    email: 'comic@qq.com',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    tags: '漫画,收藏,日本动漫',
    status: 1,
    create_time: '2024-02-15 13:10:00'
  },
  {
    id: 7,
    username: '游戏主播',
    phone: '13800138007',
    email: 'streamer@qq.com',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    tags: '直播,游戏解说,电竞',
    status: 1,
    create_time: '2024-02-20 15:30:00'
  },
  {
    id: 8,
    username: '声优控',
    phone: '13800138008',
    email: 'seiyuu@qq.com',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    tags: '声优,广播剧,日语',
    status: 0,
    create_time: '2024-02-25 09:50:00'
  },
  {
    id: 9,
    username: '手办达人',
    phone: '13800138009',
    email: 'figure@qq.com',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    tags: '手办,模型,收藏',
    status: 1,
    create_time: '2024-03-01 14:15:00'
  },
  {
    id: 10,
    username: '同人画师',
    phone: '13800138010',
    email: 'artist@qq.com',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    tags: '绘画,同人,插画',
    status: 1,
    create_time: '2024-03-05 10:05:00'
  },
  {
    id: 11,
    username: '轻小说读者',
    phone: '13800138011',
    email: 'novel@qq.com',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    tags: '轻小说,文学,日本文学',
    status: 1,
    create_time: '2024-03-10 16:40:00'
  },
  {
    id: 12,
    username: '音乐爱好者',
    phone: '13800138012',
    email: 'music@qq.com',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    tags: '动漫音乐,OP,ED',
    status: 1,
    create_time: '2024-03-15 12:25:00'
  },
  {
    id: 13,
    username: '技术宅',
    phone: '13800138013',
    email: 'tech@qq.com',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    tags: '编程,技术,动漫',
    status: 0,
    create_time: '2024-03-20 08:30:00'
  },
  {
    id: 14,
    username: '新番追更',
    phone: '13800138014',
    email: 'newanime@qq.com',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    tags: '新番,追更,季度动画',
    status: 1,
    create_time: '2024-03-25 17:20:00'
  },
  {
    id: 15,
    username: '老番怀旧',
    phone: '13800138015',
    email: 'oldanime@qq.com',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    tags: '怀旧,经典,老番',
    status: 1,
    create_time: '2024-03-30 14:55:00'
  }
])

//计算属性：过滤后的用户
const filteredUsers = computed(() => {
  let users = [...allUsers.value] // 先复制一份所有用户
  
  // 关键词搜索：如果有输入关键词，就过滤出包含关键词的用户
  if (searchParams.keyword) {
    const keyword = searchParams.keyword.toLowerCase() // 转小写，方便不区分大小写搜索
    users = users.filter(user => 
      user.username?.toLowerCase().includes(keyword) || // 用户名包含关键词
      user.phone?.includes(keyword) || // 手机号包含（?表示如果phone不存在也不报错）
      user.email?.toLowerCase().includes(keyword) || // 邮箱包含
      user.tags?.toLowerCase().includes(keyword) // 标签包含
    )
  }
  
  // 状态筛选：如果选择了状态，就只留对应状态的用户
  if (searchParams.status !== '') {
    users = users.filter(user => user.status.toString() === searchParams.status)
  }
  
  return users // 返回过滤后的用户
})

// 计算属性：分页显示的用户
const displayUsers = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize // 开始位置（比如第1页从0开始，第2页从10开始）
  const end = start + pagination.pageSize // 结束位置（比如第1页到10，第2页到20）
  return filteredUsers.value.slice(start, end) // 从过滤后的用户里，截取这一页要显示的
}) 

//监听过滤后的数据，动态更新总条数
watch(filteredUsers,(newVal)=>{
  pagination.total=newVal.length;
},{immediate:true})


// 搜索处理
const handleSearch = () => {
  pagination.currentPage = 1 // 搜索时回到第1页
  pagination.total = filteredUsers.value.length // 总条数更新为过滤后的数量
}

// 重置搜索
const resetSearch = () => {
  searchParams.keyword = '' // 清空关键词
  searchParams.status = '' // 清空状态筛选
  pagination.currentPage = 1 // 回到第1页
  pagination.total =allUsers.value.length;//总条数恢复为原始数据长度
}

// 添加用户
const addUser = () => {
  dialog.mode = 'add' // 设为添加模式
  dialog.userData = null // 清空用户数据
  dialog.visible = true // 显示弹窗
}

// 编辑用户
const handleEdit = (user) => {
  console.log('触发编辑', user);
  dialog.mode = 'edit' // 设为编辑模式
  dialog.userData = { ...user } // 复制要编辑的用户数据（避免直接改原数据）
  dialog.visible = true // 显示弹窗
}

// 删除用户
const handleDelete = (user) => {
  // 弹出确认框，问是否确定删除
  ElMessageBox.confirm(`确定删除用户 "${user.username}" 吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // 如果点了确定，就从allUsers里删掉这个用户（过滤掉id不等于当前用户id的）
    allUsers.value = allUsers.value.filter(u => u.id !== user.id)
    ElMessage.success('删除成功') // 显示成功提示
  })
}

// 导出数据
const exportData = () => {
  ElMessage.info('导出功能开发中...')
}

// 1. 分页-每页条数变化（handleSizeChange）
const handleSizeChange = (size) => {
  // 当每页显示条数变化时，重置当前页为第1页
  pagination.pageSize = size;
  pagination.currentPage = 1;
};

// 2. 分页-页码变化（handleCurrentChange）
const handleCurrentChange = (page) => {
  // 当页码变化时，更新当前页
  pagination.currentPage = page;
};

// 3. 对话框确认（handleDialogConfirm）
const handleDialogConfirm = (userData) => {
  if (dialog.mode === 'add') {
    // 添加新用户逻辑（生成新ID，补充默认字段）
    const newUser = {
      id: Date.now(), // 临时用时间戳当ID，实际应从后端获取
      ...userData,
      create_time: new Date().toLocaleString(), // 注册时间
      status: 1, // 默认正常状态
      role: 0 // 默认普通用户
    };
    allUsers.value.unshift(newUser); // 添加到列表头部
    ElMessage.success('用户添加成功！');
  } else {
    // 编辑用户逻辑（更新已有用户）
    const index = allUsers.value.findIndex(u => u.id === userData.id);
    if (index !== -1) {
      allUsers.value[index] = { ...allUsers.value[index], ...userData };
      ElMessage.success('用户更新成功！');
    }
  }
  dialog.visible = false; // 关闭对话框
};

</script>
<style scoped>
.header-content {
  display: flex; /* 让里面的内容左右排列 */
  justify-content: space-between; /* 左右两边对齐（标题在左，按钮在右） */
  align-items: center; /* 上下居中 */
  height: 100%; /* 占满顶部栏高度 */
}

.header-actions {
  display: flex; /* 按钮横向排列 */
  gap: 10px; /* 按钮之间间距10px */
}

.search-toolbar {
  display: flex; /* 搜索框、选择器、按钮横向排列 */
  gap: 10px; /* 之间间距10px */
  align-items: center; /* 上下居中 */
}

.batch-actions {
  padding: 10px; /* 内边距10px */
  background: #f0f9ff; /* 浅蓝色背景 */
  border: 1px solid #e1f5fe; /* 浅蓝边框 */
  border-radius: 4px; /* 圆角 */
  margin-bottom: 10px; /* 下面间距10px */
  display: flex; /* 内容横向排列 */
  align-items: center; /* 上下居中 */
  gap: 10px; /* 内容之间间距 */
}

.pagination-container {
  margin-top: 20px; /* 上面间距20px */
  text-align: right; /* 分页靠右显示 */
}
</style>