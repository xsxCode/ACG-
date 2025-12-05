<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="500px"
    :before-close="handleClose"
  >
    <el-form
      ref="userForm"
      :model="formData"
      label-width="100px"
      :rules="formRules"
    >
      <!-- 用户名 -->
      <el-form-item label="用户名" prop="username" required>
        <el-input v-model="formData.username" placeholder="请输入用户名" maxlength="20" />
      </el-form-item>

      <!-- 手机号 -->
      <el-form-item label="手机号" prop="phone" required>
        <el-input v-model="formData.phone" placeholder="请输入手机号" maxlength="11" />
      </el-form-item>

      <!-- 邮箱 -->
      <el-form-item label="邮箱" prop="email" required>
        <el-input v-model="formData.email" placeholder="请输入邮箱" type="email" />
      </el-form-item>

      <!-- 角色（新增，编辑时回显） -->
      <el-form-item label="用户角色" prop="role" required>
        <el-select v-model="formData.role" placeholder="请选择角色">
          <el-option label="普通用户" value="0" />
          <el-option label="管理员" value="1" />
        </el-select>
      </el-form-item>

      <!-- 状态 -->
      <el-form-item label="用户状态" prop="status" required>
        <el-select v-model="formData.status" placeholder="请选择状态">
          <el-option label="正常" value="1" />
          <el-option label="禁用" value="0" />
        </el-select>
      </el-form-item>

      <!-- 标签（对应signature，编辑时回显） -->
      <el-form-item label="用户标签">
        <el-input v-model="formData.tags" placeholder="多个标签用逗号分隔（比如：原神,cosplay）" />
      </el-form-item>

      <!-- 密码：仅添加模式显示 -->
      <el-form-item label="密码" prop="password" v-if="props.mode === 'add'">
        <el-input v-model="formData.password" type="password" placeholder="请输入密码（不少于6位）" show-password />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, computed } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  visible: { type: Boolean, default: false },
  userData: { type: Object, default: null },
  mode: { type: String, default: 'add' }
});

const emit = defineEmits(['update:visible', 'confirm']);

// 表单数据（包含role字段）
const formData = ref({
  id: '',
  username: '',
  phone: '',
  email: '',
  role: '0', // 默认普通用户
  status: '1', // 默认正常
  tags: '', // 对应后端signature字段
  password: ''
});

// 表单验证规则（编辑时无需验证密码）
const formRules = computed(() => {
  const rules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '用户名长度2-20字符', trigger: 'blur' }
    ],
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误', trigger: 'blur' }
    ],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '邮箱格式错误', trigger: 'blur' }
    ],
    role: [
      { required: true, message: '请选择用户角色', trigger: 'change' }
    ],
    status: [
      { required: true, message: '请选择用户状态', trigger: 'change' }
    ]
  };
  // 仅添加模式验证密码
  if (props.mode === 'add') {
    rules.password = [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, message: '密码长度不少于6位', trigger: 'blur' }
    ];
  }
  return rules;
});

const userForm = ref(null);
const dialogVisible = ref(props.visible);
const dialogTitle = ref(props.mode === 'add' ? '添加用户' : '编辑用户');

// 监听mode变化，更新标题和表单
watch(() => props.mode, (newMode) => {
  dialogTitle.value = newMode === 'add' ? '添加用户' : '编辑用户';
  // 编辑模式清空密码，添加模式重置密码
  formData.value.password = newMode === 'add' ? '' : '';
}, { immediate: true });

// 监听userData变化，回显表单（核心：编辑时填充数据）
watch(() => props.userData, (newUserData) => {
  if (newUserData && props.mode === 'edit') {
    // 深拷贝避免原数据污染，同时适配字段映射
    formData.value = {
      id: newUserData.id,
      username: newUserData.username || '',
      phone: newUserData.phone || '',
      email: newUserData.email || '',
      role: newUserData.role.toString() || '0', // 数字转字符串（适配下拉框）
      status: newUserData.status.toString() || '1', // 数字转字符串
      tags: newUserData.signature || '', // 后端signature映射到前端tags
      password: '' // 编辑时清空密码
    };
  } else if (props.mode === 'add') {
    // 添加模式重置表单
    formData.value = {
      id: '',
      username: '',
      phone: '',
      email: '',
      role: '0',
      status: '1',
      tags: '',
      password: ''
    };
  }
}, { immediate: true });

// 监听父组件visible，同步弹窗状态
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal;
}, { immediate: true });

// 提交表单
const handleConfirm = async () => {
  try {
    await userForm.value.validate();
    emit('confirm', { ...formData.value }); // 传递完整表单数据（含id）
    emit('update:visible', false);
  } catch (error) {
    ElMessage.error('表单验证失败，请检查输入');
  }
};

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false);
  if (userForm.value) userForm.value.resetFields();
};
</script>