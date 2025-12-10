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

      <!-- 筛选区：新增圈子/标签筛选（联动后端列表） -->
      <el-card class="filter-card mb-4">
        <el-form :model="filterForm" inline @submit.prevent="fetchPosts">
          <el-form-item label="标题">
            <el-input v-model="filterForm.title" placeholder="请输入帖子标题" clearable />
          </el-form-item>
          <el-form-item label="标签">
            <el-select v-model="filterForm.tagId" placeholder="全部标签" clearable>
              <el-option 
                v-for="tag in tagList" 
                :key="tag.id" 
                :label="tag.name" 
                :value="tag.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="圈子">
            <el-select v-model="filterForm.circleId" placeholder="全部圈子" clearable>
              <el-option 
                v-for="circle in circleList" 
                :key="circle.id" 
                :label="circle.name" 
                :value="circle.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
              <el-option label="已发布" value="1" />
              <el-option label="草稿" value="2" />
              <el-option label="已下架" value="0" />
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

        <!-- 列表区：显示圈子/标签名称（适配多对多标签） -->
        <el-table :data="postList" border @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="title" label="帖子标题" min-width="200" show-overflow-tooltip />
          <!-- 圈子名称：通过post.circleId匹配circleList的name -->
          <el-table-column label="所属圈子" width="120">
            <template #default="scope">
              {{ getCircleNameById(scope.row.circleId) || '未关联' }}
            </template>
          </el-table-column>
          <!-- 标签名称：适配多对多，显示多个标签 -->
          <el-table-column label="标签" width="200">
            <template #default="scope">
              <el-tag 
                v-for="tagId in scope.row.tagIds" 
                :key="tagId" 
                size="small"
                class="mr-1"
              >
                {{ getTagNameById(tagId) }}
              </el-tag>
              <span v-if="!scope.row.tagIds || scope.row.tagIds.length === 0">无标签</span>
            </template>
          </el-table-column>
          <el-table-column prop="userId" label="作者" width="100" />
          <el-table-column label="发布时间" width="180">
            <template #default="scope">
              {{ formatTime(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 1 ? 'success' : scope.row.status === 0 ? 'warning' : 'info'">
                {{ scope.row.status === 1 ? '已发布' : scope.row.status === 0 ? '已下架' : '草稿' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button type="link" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button type="link" :type="scope.row.status === 1 ? 'warning' : 'success'" @click="handleStatusChange(scope.row)">
                {{ scope.row.status === 1 ? '下架' : scope.row.status === 0 ? '上架' : '发布' }}
              </el-button>
              <el-button type="link" danger @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 新增/编辑帖子模态框：标签改为多选（适配多对多） -->
    <el-dialog
      v-model="modalVisible"
      :title="isEdit ? '编辑帖子' : '新增帖子'"
      width="800px"
      @close="resetPostForm"
    >
      <el-form
        ref="postFormRef"
        :model="postForm"
        :rules="postFormRules"
        label-width="100px"
        style="padding: 0 20px;"
      >
        <el-form-item label="帖子标题" prop="title">
          <el-input
            v-model="postForm.title"
            placeholder="请输入帖子标题（最多200字）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <!-- 圈子下拉：联动圈子列表 -->
        <el-form-item label="所属圈子" prop="circleId">
          <el-select v-model="postForm.circleId" placeholder="请选择所属圈子">
            <el-option 
              v-for="circle in circleList" 
              :key="circle.id" 
              :label="circle.name" 
              :value="circle.id"
            />
          </el-select>
        </el-form-item>
        <!-- 标签下拉：改为多选（适配多对多） -->
        <el-form-item label="标签" prop="tagIds">
          <el-select v-model="postForm.tagIds" placeholder="请选择标签" multiple>
            <el-option 
              v-for="tag in tagList" 
              :key="tag.id" 
              :label="tag.name" 
              :value="tag.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="作者ID" prop="userId">
          <el-input v-model="postForm.userId" type="number" placeholder="请输入作者ID（数字）" />
        </el-form-item>
        <el-form-item label="帖子内容" prop="content">
          <el-input
            v-model="postForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入帖子详细内容"
          />
        </el-form-item>
        <el-form-item label="封面URL" prop="coverUrl">
          <el-input v-model="postForm.coverUrl" placeholder="请输入封面图片URL" />
        </el-form-item>
        <el-form-item label="媒体类型" prop="mediaType">
          <el-select v-model="postForm.mediaType" placeholder="请选择媒体类型">
            <el-option label="图片" value="image" />
            <el-option label="视频" value="video" />
          </el-select>
        </el-form-item>
        <el-form-item label="发布状态" prop="status">
          <el-radio-group v-model="postForm.status">
            <el-radio label="1">已发布</el-radio>
            <el-radio label="2">草稿</el-radio>
            <el-radio label="0">已下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPostForm">确认提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
// 导入左侧导航栏组件（复用）
import Sidebar from '../components/Sidebar.vue';
// 导入dayjs处理时间格式化
import dayjs from 'dayjs';
// 导入所有接口方法
import { 
  fetchPosts as fetchPostsApi, 
  batchOperatePosts, 
  updatePostStatus, 
  deletePost, 
  addPost, 
  editPost,
  fetchCircleList, 
  fetchTagList 
} from '../api/postApi';
// 新增：导入帖子-标签关联接口
import { 
  getTagIdsByPostId,  // 根据帖子ID查标签ID
  savePostTagRelation // 保存帖子-标签关联（新增/编辑）
} from '../api/postTag';

// === 核心联动数据：圈子/标签列表 ===
const circleList = ref([]); // 所有圈子（从后端获取）
const tagList = ref([]);   // 所有标签（从后端获取）

// 时间格式化方法
const formatTime = (time) => {
  if (!time) return '-';
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
};

// 通过circleId获取圈子名称（用于列表显示）
const getCircleNameById = (circleId) => {
  if (!circleId) return '未关联';
  // 统一转为数字匹配（兼容后端返回的数字/字符串ID）
  const targetId = Number(circleId);
  const circle = circleList.value.find(item => Number(item.id) === targetId);
  return circle ? circle.name : '未关联';
};

// 通过tagId获取标签名称（用于列表显示）
const getTagNameById = (tagId) => {
  if (!tagId) return '';
  const targetId = Number(tagId);
  const tag = tagList.value.find(item => Number(item.id) === targetId);
  return tag ? tag.name : '';
};

// 筛选表单：包含圈子/标签筛选
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

// 模态框相关
const modalVisible = ref(false);
const isEdit = ref(false);
const postFormRef = ref(null);
// 帖子表单：适配多对多标签（tagIds改为数组）
const postForm = reactive({
  id: '',
  title: '',
  userId: '',
  circleId: '', // 关联圈子ID
  tagIds: [],   // 关联标签ID数组（多对多）
  content: '',
  coverUrl: '',
  mediaType: 'image',
  status: '1'
});

// 表单校验规则：标签改为数组校验
const postFormRules = reactive({
  title: [
    { required: true, message: '请输入帖子标题', trigger: 'blur' },
    { max: 200, message: '标题长度不能超过200字', trigger: 'blur' }
  ],
  userId: [
    { required: true, message: '请输入作者ID', trigger: 'blur' },
    { type: 'number', message: '作者ID必须为数字', trigger: 'blur' }
  ],
  circleId: [
    { required: true, message: '请选择所属圈子', trigger: 'change' }
  ],
  tagIds: [
    { required: true, message: '请选择至少一个标签', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入帖子内容', trigger: 'blur' }
  ],
  coverUrl: [
    { required: true, message: '请输入封面URL', trigger: 'blur' }
  ],
  mediaType: [
    { required: true, message: '请选择媒体类型', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择发布状态', trigger: 'change' }
  ]
});

// 初始化：先获取圈子/标签列表，再加载帖子
onMounted(async () => {
  await Promise.all([
    fetchCircleListApi(), 
    fetchTagListApi()     
  ]);
  fetchPosts(); 
});

// === 获取圈子列表（从后端接口） ===
const fetchCircleListApi = async () => {
  try {
    const res = await fetchCircleList();
    if (res.code === 200) {
      circleList.value = res.data || [];
    }
  } catch (err) {
    ElMessage.error('获取圈子列表失败');
    console.error(err);
  }
};

// === 获取标签列表（从后端接口） ===
const fetchTagListApi = async () => {
  try {
    const res = await fetchTagList();
    if (res.code === 200) {
      tagList.value = res.data || [];
    }
  } catch (err) {
    ElMessage.error('获取标签列表失败');
    console.error(err);
  }
};

// 拉取帖子列表：补充标签ID查询（多对多）
const fetchPosts = async () => {
  try {
    const params = {
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      title: filterForm.title || undefined,
      status: filterForm.status || undefined,
      circleId: filterForm.circleId || undefined, 
      tagId: filterForm.tagId || undefined,       
      startTime: filterForm.dateRange?.[0] ? dayjs(filterForm.dateRange[0]).format('YYYY-MM-DD') : undefined,
      endTime: filterForm.dateRange?.[1] ? dayjs(filterForm.dateRange[1]).format('YYYY-MM-DD') : undefined
    };
    // 1. 获取帖子基础数据
    const res = await fetchPostsApi(params);
    const originPosts = res.data || [];
    total.value = res.total || 0;

    // 2. 批量查询每个帖子的标签ID（适配多对多）
    const postsWithTags = await Promise.all(
      originPosts.map(async (post) => {
        try {
          // 调用帖子-标签关联接口
          const tagRes = await getTagIdsByPostId(post.id);
          return {
            ...post,
            tagIds: tagRes.code === 200 ? tagRes.data : [] // 标签ID数组
          };
        } catch (err) {
          console.error(`查询帖子${post.id}标签失败：`, err);
          return { ...post, tagIds: [] };
        }
      })
    );

    postList.value = postsWithTags;
  } catch (err) {
    ElMessage.error('获取帖子列表失败：' + (err.message || '网络异常'));
    console.error(err);
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

// 批量操作
const handleBatchOperate = async (command) => {
  if (selectedPosts.value.length === 0) {
    return ElMessage.warning('请选择要操作的帖子');
  }
  const ids = selectedPosts.value.map(item => item.id);
  try {
    const targetStatus = command === 'publish' ? 1 : command === 'offline' ? 0 : -1;
    if (command === 'delete') {
      await batchOperatePosts({ ids, type: 'delete' });
      ElMessage.success('批量删除成功');
    } else if (targetStatus !== -1) {
      await batchOperatePosts({ ids, type: 'status', status: targetStatus });
      ElMessage.success(`批量${command === 'publish' ? '发布' : '下架'}成功`);
    }
    fetchPosts();
  } catch (err) {
    ElMessage.error('批量操作失败');
    console.error(err);
  }
};

// 打开新增模态框
const handleAdd = () => {
  isEdit.value = false;
  resetPostForm();
  modalVisible.value = true;
};

// 打开编辑模态框：回显圈子/标签（适配多对多标签）
const handleEdit = async (row) => {
  isEdit.value = true;
  // 1. 回显基础信息
  postForm.id = row.id;
  postForm.title = row.title;
  postForm.userId = row.userId;
  postForm.circleId = row.circleId;
  postForm.content = row.content || '';
  postForm.coverUrl = row.coverUrl || '';
  postForm.mediaType = row.mediaType || 'image';
  postForm.status = row.status.toString();

  // 2. 回显标签（查询该帖子的标签ID）
  try {
    const tagRes = await getTagIdsByPostId(row.id);
    postForm.tagIds = tagRes.code === 200 ? tagRes.data : [];
  } catch (err) {
    ElMessage.warning('获取帖子标签失败，默认清空');
    postForm.tagIds = [];
  }

  modalVisible.value = true;
};

// 重置帖子表单
const resetPostForm = () => {
  if (postFormRef.value) {
    postFormRef.value.resetFields();
  }
  postForm.id = '';
  postForm.title = '';
  postForm.userId = '';
  postForm.circleId = '';
  postForm.tagIds = [];
  postForm.content = '';
  postForm.coverUrl = '';
  postForm.mediaType = 'image';
  postForm.status = '1';
};

// 提交新增/编辑表单：保存帖子+标签关联
const submitPostForm = async () => {
  try {
    await postFormRef.value.validate();
    // 1. 组装帖子基础数据
    const submitData = {
      id: postForm.id,
      title: postForm.title,
      userId: Number(postForm.userId),
      circleId: postForm.circleId,
      content: postForm.content,
      coverUrl: postForm.coverUrl,
      mediaType: postForm.mediaType,
      status: Number(postForm.status)
    };

    // 2. 保存帖子（新增/编辑）
    let res;
    if (isEdit.value) {
      res = await editPost(submitData);
    } else {
      res = await addPost(submitData);
    }

    if (res.code === 200) {
      // 3. 保存帖子-标签关联（多对多）
      const postId = isEdit.value ? postForm.id : res.data.id; // 新增返回的帖子ID
      await savePostTagRelation({
        postId: Number(postId),
        tagIds: postForm.tagIds.map(Number) // 转为数字数组
      });

      ElMessage.success(isEdit.value ? '编辑帖子成功' : '新增帖子成功');
      modalVisible.value = false;
      fetchPosts(); // 刷新列表
    }
  } catch (err) {
    if (err.name !== 'ValidationError') {
      ElMessage.error(isEdit.value ? '编辑帖子失败' : '新增帖子失败');
      console.error(err);
    }
  }
};

// 删除单个帖子
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该帖子吗？', '提示', { type: 'warning' });
    await deletePost(row.id);
    ElMessage.success('删除成功');
    fetchPosts();
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败');
      console.error(err);
    } else {
      ElMessage.info('已取消删除');
    }
  }
};

// 更新帖子状态
const handleStatusChange = async (row) => {
  const targetStatus = row.status === 1 ? 0 : 1;
  try {
    await updatePostStatus({ id: row.id, status: targetStatus });
    ElMessage.success(`操作成功`);
    fetchPosts();
  } catch (err) {
    ElMessage.error('状态修改失败');
    console.error(err);
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
/* 标签间距 */
.mr-1 {
  margin-right: 4px;
}
</style>