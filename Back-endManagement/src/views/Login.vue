<template>
  <!-- 页面容器：使用flex实现垂直居中 -->
  <div class="login-page">
    <!-- 卡片容器 -->
    <el-card class="login-card">
      <!-- 标题 -->
      <h1 class="title">ACG碰碰部落管理系统</h1>
      
      <!-- 表单 -->
      <el-form 
        ref="formRef" 
        :model="loginForm"
        :rules="rules"
        status-icon
      >
        <!-- 用户名输入框 -->
        <el-form-item 
          label="用户名"
          prop="username"
          label-width="80px"
        >
          <el-input 
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            clearable
          ></el-input>
        </el-form-item>

        <!-- 密码输入框 -->
        <el-form-item 
          label="密码"
          prop="password"
          label-width="80px"
        >
          <el-input 
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            clearable
          ></el-input>
        </el-form-item>

        <!-- 登录按钮 -->
        <el-form-item class="login-btn-item">
          <el-button 
            type="primary"
            class="login-btn"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
// 导入Vue响应式API
import { ref } from 'vue'
// 导入Element消息提示组件
// import { ElMessage } from 'element-plus'

// 表单数据（响应式）
const loginForm = ref({
  username: '',
  password: ''
})

// 表单验证规则
const rules = ref({
  username: [
    { 
      required: true,
      message: '请输入用户名',
      trigger: 'blur'
    },
    { 
      min: 3,
      max: 20,
      message: '用户名长度在 3 到 20 个字符',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 16, message: '密码长度在 8 到 16 个字符', trigger: 'blur' },
    { 
      pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/,
      message: '密码必须包含字母和数字', 
      trigger: 'blur' 
    }
  ]
})

// 表单实例（用于调用validate方法）
const formRef = ref(null)

// 登录按钮点击事件 - 使用最可靠的跳转方法
const handleLogin = async () => {
  console.log('开始登录验证...')
  
  // 表单验证
  const isValid = await formRef.value.validate().catch(err => {
    console.error('表单验证失败：', err)
    return false
  })

  // 如果验证失败，直接返回
  if (!isValid) {
    ElMessage.error('请检查输入信息是否正确')
    return
  }

  console.log('表单验证通过')
  
  // 显示登录成功提示
  ElMessage.success('登录成功！正在跳转...')
  
  // 使用最可靠的跳转方法：window.location
  setTimeout(() => {
    console.log('使用 window.location 跳转到用户列表页')
    window.location.href =  '/dashboard';
  }, 1000)
}
</script>

<style scoped>
/* 页面容器样式 */
.login-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

/* 卡片样式 */
.login-card {
  width: 400px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

/* 标题样式 */
.title {
  text-align: center;
  font-size: 20px;
  color: #303133;
  margin-bottom: 30px;
}

/* 登录按钮容器 */
.login-btn-item {
  margin-top: 20px;
}

/* 登录按钮样式 */
.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
}
</style>