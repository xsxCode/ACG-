<template>
  <!-- 弹窗组件：通过v-model:visible控制显示/隐藏 -->
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="500px"
    :before-close="handleClose"
  >
    <!-- 表单：用于收集用户信息（用户名、手机号等） -->
    <el-form
      ref="userForm"
      :model="formData"
      label-width="100px"
    >
      <!-- 用户名输入项：必填，最多20字符 -->
      <el-form-item
        label="用户名"
        required
      >
        <el-input
          v-model="formData.username"
          placeholder="请输入用户名"
          maxlength="20"
        />
      </el-form-item>

      <!-- 手机号输入项：必填，11位 -->
      <el-form-item
        label="手机号"
        required
      >
        <el-input
          v-model="formData.phone"
          placeholder="请输入手机号"
          maxlength="11"
        />
      </el-form-item>

      <!-- 邮箱输入项：必填，格式校验 -->
      <el-form-item
        label="邮箱"
        required
      >
        <el-input
          v-model="formData.email"
          placeholder="请输入邮箱"
          type="email"
        />
      </el-form-item>

      <!-- 用户状态选择：必填，默认正常 -->
      <el-form-item
        label="用户状态"
        required
      >
        <el-select
          v-model="formData.status"
          placeholder="请选择状态"
        >
          <el-option label="正常" value="1" />
          <el-option label="禁用" value="0" />
        </el-select>
      </el-form-item>

      <!-- 标签输入项：选填，多标签用逗号分隔 -->
      <el-form-item
        label="用户标签"
      >
        <el-input
          v-model="formData.tags"
          placeholder="多个标签用逗号分隔（比如：原神,cosplay）"
        />
      </el-form-item>
    </el-form>

    <!-- 弹窗底部按钮区域 -->
    <template #footer>
      <span class="dialog-footer">
        <!-- 取消按钮：点击关闭弹窗 -->
        <el-button @click="handleClose">取消</el-button>
        <!-- 确定按钮：点击提交表单 -->
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
// 导入Vue工具：ref用于响应式数据，watch用于监听变化
import { ref, watch ,defineProps, defineEmits} from 'vue'
// 导入Element Plus的提示框和表单组件
// import { ElMessage, ElForm } from 'element-plus'

// 接收父组件（UserManage.vue）传递的属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  userData: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: 'add'
  }
})

// 向父组件触发事件（如关闭弹窗、提交表单）
const emit = defineEmits(['update:visible', 'confirm'])

// 表单数据：存储输入的用户信息
const formData = ref({
  username: '',
  phone: '',
  email: '',
  status: '1',
  tags: '',
  id: ''
})

// 表单引用：用于表单校验和重置
const userForm = ref(null)

// 弹窗标题：根据mode自动切换“添加/编辑”
const  dialogTitle = ref('')

// 弹窗标题：根据mode自动切换“添加/编辑”（你原来的代码里可能漏了这段）
watch(
  () => props.mode,  // 监听父组件传的 mode（add/edit）
  (newMode) => {
    // 模式是add就显示“添加用户”，是edit就显示“编辑用户”
    dialogTitle.value = newMode === 'add' ? '添加用户' : '编辑用户'
  },
  { immediate: true }  // 初始化时就执行一次（避免标题空白）
)

// 编辑时：监听父组件传的 userData，编辑时填充表单
watch(
  () => props.userData,  // 监听“要编辑的用户数据”变化
  (newUserData) => {
    if (newUserData && props.mode === 'edit') {
      // 编辑模式：把父组件传的用户数据填充到表单
      formData.value = { ...newUserData };
      // 状态转成字符串（适配下拉框的 value 类型）
      formData.value.status = formData.value.status.toString();
    } else if (props.mode === 'add') {
      // 添加模式：清空表单
      formData.value = { username: '', phone: '', email: '', status: '1', tags: '', id: '' };
    }
  },
  { immediate: true }  // 初始化时就执行一次（确保编辑时能拿到数据）
);

// 点击“确定”：提交表单并校验
const handleConfirm = async () => {
  const isValidate = await userForm.value.validate()
  if (isValidate) {
    emit('confirm', formData.value)
    emit('update:visible', false)
    ElMessage.success(props.mode === 'add' ? '添加用户成功' : '编辑用户成功')
  }
}

// 关闭弹窗：重置表单并隐藏
const handleClose = () => {
  dialogVisible.value = false;  // 👇 新增：同步子组件内部的弹窗状态
  emit('update:visible', false); // 通知父组件关闭
  // 加个判断，防止表单没渲染时调用 resetFields 报错
  if (userForm.value) {
    userForm.value.resetFields();
  }
}

// 👇 关键：定义 dialogVisible 变量（模板里要用，必须加！）
const dialogVisible = ref(props.visible)  // 初始值同步父组件的 visible

// 监听父组件的 visible 变化，同步到 dialogVisible（确保父组件控制时能更新）
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal  // 父组件打开/关闭时，子组件同步
  },
  { immediate: true }
)

</script>

<style scoped>
/* 弹窗底部按钮间距样式 */
.dialog-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>