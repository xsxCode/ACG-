<template>
  <div class="post-manager">
    <!-- 工具栏：查询+新增按钮 -->
    <div class="toolbar">
      <el-input v-model="searchForm.title" placeholder="请输入帖子标题" style="width: 300px; margin-right: 10px;"></el-input>
      <el-select v-model="searchForm.status" placeholder="请选择状态" style="width: 150px; margin-right: 10px;">
        <el-option label="全部" value=""></el-option>
        <el-option label="发布" value="1"></el-option>
        <el-option label="下架" value="0"></el-option>
        <el-option label="草稿" value="2"></el-option>
      </el-select>
      <el-button type="primary" @click="getPostList">查询</el-button>
      <el-button type="success" @click="openModal">新增帖子</el-button>
    </div>

    <!-- 帖子列表 -->
    <el-table :data="postList" border stripe style="width: 100%; margin-top: 10px;">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="title" label="帖子标题" min-width="200"></el-table-column>
      <el-table-column prop="username" label="发布人" width="120"></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : scope.row.status === 0 ? 'danger' : 'warning'">
            {{ scope.row.status === 1 ? '发布' : scope.row.status === 0 ? '下架' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="发布时间" width="200"></el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button type="primary" size="small" @click="openModal(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="deletePost(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageNum"
      :page-sizes="[10, 20, 50]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      style="margin-top: 20px; text-align: right;"
    >
    </el-pagination>

    <!-- 新增/编辑帖子模态框 -->
    <el-dialog
      v-model="modalVisible"
      :title="isEdit ? '编辑帖子' : '新增帖子'"
      width="800px"
      @close="resetForm"
    >
      <el-form
        ref="postFormRef"
        :model="postForm"
        :rules="postRules"
        label-width="100px"
        style="max-width: 700px;"
      >
        <el-form-item label="帖子标题" prop="title">
          <el-input v-model="postForm.title" placeholder="请输入帖子标题（最多200字）" maxlength="200"></el-input>
        </el-form-item>
        <el-form-item label="发布人ID" prop="userId">
          <el-input v-model="postForm.userId" type="number" placeholder="请输入发布人ID"></el-input>
        </el-form-item>
        <el-form-item label="帖子内容" prop="content">
          <el-input
            v-model="postForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入帖子内容（支持Markdown）"
          ></el-input>
        </el-form-item>
        <el-form-item label="封面URL" prop="coverUrl">
          <el-input v-model="postForm.coverUrl" placeholder="请输入封面图片URL"></el-input>
        </el-form-item>
        <el-form-item label="媒体类型" prop="mediaType">
          <el-select v-model="postForm.mediaType" placeholder="请选择媒体类型">
            <el-option label="纯图片" value="image"></el-option>
            <el-option label="纯视频" value="video"></el-option>
            <el-option label="混合" value="mixed"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属圈子ID" prop="circleId">
          <el-input v-model="postForm.circleId" type="number" placeholder="请输入圈子ID（默认0）"></el-input>
        </el-form-item>
        <el-form-item label="帖子状态" prop="status">
          <el-radio-group v-model="postForm.status">
            <el-radio label="1">发布</el-radio>
            <el-radio label="0">下架</el-radio>
            <el-radio label="2">草稿</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPost">确认提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getPostList, addPost, editPost, deletePost as delPost } from '../api/postApi'; // 导入你的接口
import {getTagIdsByPostId} from '../api/postTag';

// 分页参数
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 搜索表单
const searchForm = reactive({
  title: '',
  status: ''
});

// 帖子列表
const postList = ref([]);

// 模态框相关
const modalVisible = ref(false); // 模态框显示状态
const isEdit = ref(false); // 是否为编辑模式
const postFormRef = ref(null); // 表单ref

// 帖子表单
const postForm = reactive({
  id: '', // 编辑时的帖子ID
  title: '',
  userId: '',
  content: '',
  coverUrl: '',
  mediaType: 'image',
  circleId: 0,
  status: '1'
});

// 表单校验规则
const postRules = reactive({
  title: [
    { required: true, message: '请输入帖子标题', trigger: 'blur' },
    { max: 200, message: '标题长度不能超过200字', trigger: 'blur' }
  ],
  userId: [
    { required: true, message: '请输入发布人ID', trigger: 'blur' },
    { type: 'number', message: '发布人ID必须为数字', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入帖子内容', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择帖子状态', trigger: 'change' }
  ]
});

// 获取帖子列表
const getPostList = async () => {
  try {
    const res = await getPostList({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      title: searchForm.title,
      status: searchForm.status
    });
    if (res.code === 200) {
      postList.value = res.data;
      total.value = res.total;
    }
  } catch (error) {
    ElMessage.error('获取帖子列表失败');
    console.error(error);
  }
};

// 打开模态框（新增/编辑）
const openModal = (row) => {
  modalVisible.value = true;
  if (row) {
    // 编辑模式：回显数据
    isEdit.value = true;
    postForm.id = row.id;
    postForm.title = row.title;
    postForm.userId = row.userId;
    postForm.content = row.content;
    postForm.coverUrl = row.coverUrl || '';
    postForm.mediaType = row.mediaType || 'image';
    postForm.circleId = row.circleId || 0;
    postForm.status = row.status.toString();
  } else {
    // 新增模式：重置表单
    isEdit.value = false;
    resetForm();
  }
};

// 重置表单
const resetForm = () => {
  postFormRef.value?.resetFields();
  postForm.id = '';
  postForm.title = '';
  postForm.userId = '';
  postForm.content = '';
  postForm.coverUrl = '';
  postForm.mediaType = 'image';
  postForm.circleId = 0;
  postForm.status = '1';
};

// 提交帖子（新增/编辑）
const submitPost = async () => {
  try {
    // 表单校验
    await postFormRef.value.validate();
    
    // 构造请求参数
    const params = {
      title: postForm.title,
      userId: Number(postForm.userId),
      content: postForm.content,
      coverUrl: postForm.coverUrl,
      mediaType: postForm.mediaType,
      circleId: Number(postForm.circleId),
      status: Number(postForm.status)
    };

    let res;
    if (isEdit.value) {
      // 编辑帖子
      params.id = postForm.id;
      res = await editPost(params);
    } else {
      // 新增帖子
      res = await addPost(params);
    }

    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '编辑帖子成功' : '新增帖子成功');
      modalVisible.value = false;
      getPostList(); // 刷新列表
    }
  } catch (error) {
    if (error.name !== 'ValidationError') {
      ElMessage.error(isEdit.value ? '编辑帖子失败' : '新增帖子失败');
      console.error(error);
    }
  }
};

// 删除帖子
const deletePost = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该帖子吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const res = await delPost(id);
    if (res.code === 200) {
      ElMessage.success('删除帖子成功');
      getPostList(); // 刷新列表
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除帖子失败');
      console.error(error);
    }
  }
};

// 分页事件
const handleSizeChange = (val) => {
  pageSize.value = val;
  getPostList();
};

const handleCurrentChange = (val) => {
  pageNum.value = val;
  getPostList();
};

// 初始化加载列表
onMounted(() => {
  getPostList();
});
</script>

<style scoped>
.post-manager {
  padding: 20px;
}

.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>