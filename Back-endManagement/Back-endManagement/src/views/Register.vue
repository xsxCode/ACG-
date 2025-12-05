<template >
   <!-- 复用登录页的页面容器样式  -->
    <div class="login-page">
        <!-- 卡片容器 -->
        <el-card class="login-card">
            <!-- 标题  -->
            <h1 class="title">账号注册</h1>
            <!--表单区域：ref用于获取表单实例，:model绑定数据，:rules绑定验证规则  -->
            <el-form ref="formRef"  :model="registerForm" :rules="rules" label-width="80px" label-position="right">
                <!-- 这里将逐步添加表单字段 -->
                 <!-- 
                 v-model="registerForm.username"：双向绑定到表单数据
                 prefix-icon="User"：显示用户图标
                 placeholder：提示文字
                 -->
                <el-form-item  label="用户名" prop="username">
                    <el-input v-model="registerForm.username" placeholder="请输入用户名" prefix-icon="User" class="custom-input"></el-input>
                </el-form-item>

                <!--密码输入框区域  -->
                <!-- prop="password"：与表单数据的password属性绑定 -->
                <el-form-item  label="密码" prop="password"> 
                    <!-- type="password"：密码框模式（输入内容隐藏）
                        show-password：显示密码可见性切换按钮
                        prefix-icon="Lock"：显示锁图标
                        show-password  这行是密码显示/隐藏切换按钮  -->
                    <el-input
                    v-model="registerForm.password"
                    type="password"
                    placeholder="8-16位字符+数字组合"
                    prefix-icon="Lock" 
                    show-password 
                    class="custom-input"
                    ></el-input>
                </el-form-item>
                <!-- 确认密码输入框区域 -->
                <!-- prop="confirmPassword"：与表单数据的confirmPassword属性绑定 -->
                <el-form-item label="确认密码" prop="confirmPassword"> 
                    <el-input
                    v-model="registerForm.confirmPassword"
                    type="password"
                    placeholder="请再次输入密码"
                    prefix-icon="Lock" 
                    show-password
                    class="custom-input"
                    ></el-input>
                </el-form-item>
                <!-- 邮箱框域 -->
                <el-form-item label="邮箱" prop="email">
                    <el-input
                    v-model="registerForm.email"
                    placeholder="请输入邮箱"
                    prefix-icon="Messsage"
                    class="custom-input"
                    ></el-input>
                </el-form-item>
                <el-form-item class="btn-item"> 
                    <el-button type="primary" @click="handleRegister">注册</el-button>
                </el-form-item>

            </el-form>
            
        </el-card>
    </div>
</template>
<script setup>
//导入Vue的响应式函数
import { ref,reactive } from 'vue'
//导入Element Plus的消息提示组件
// import { ElMessage } from 'element-plus'
//导入路由功能（用于页面跳转）
import { useRouter } from 'vue-router';

//创建路由实例
const router = useRouter()
//注册表单数据（后续会添加字段）
const registerForm = reactive({
    username: '',//用户名数据，双向绑定到输入框
    password: '',//密码数据，双向绑定到输入框
    confirmPassword: '',//确认密码数据，双向绑定到输入框
    email: ''//邮箱数据，双向绑定到输入框
})

//表单实例引用（用于调用验证方法
const formRef = ref(null)

//
const handleRegister = async ()=>{
   console.log('点击了注册')
   ElMessage.success('注册功能开发咋中！')
}

//表单验证规则（后续会添加规则）
const rules = ref({
    username:[
        { required: true, message: '请输入用户名', trigger: 'blur' }, //失去焦点时验证必填
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }, //长度限制
    ],
    //密码验证规则
    password:[
        { required: true, message: '请输入密码', trigger: 'blur' }, //失去焦点时验证必填
        { min: 8, max: 16, message: '长度在 8 到 16 个字符', trigger: 'blur' }, //长度限制
        { pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/, message: '必须包含数字和字母', trigger:'blur'}
    ],
    //确认密码验证规则
    confirmPassword:[
        { required: true, message: '请输入确认密码', trigger: 'blur' }, //失去焦点时验证必填
        //自定义验证：检查两次密码是否一致
        {
            validator:(rule,value,callback)=>{
                // value是确认密码输入框的值
                // registerForm.value.password是密码输入框的值
                if(value !== registerForm.password){
                    callback(new Error('两次输入的密码不一致'))
                }else{
                    callback()
                }
            }
        },
        { trigger:'blur' } //失去焦点时验证
    ],
    email:[
        {required: true, message: '请输入邮箱', trigger: 'blur'},
        {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: 'blur'
        }
    ]
 
})

</script>
<style scoped>
/*  页面容器 */
.login-page{
    background-color: #f5f5f5 ;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

/* 卡片容器  */
.login-card{
    width: 500px;
    padding: 40px;
}

/* 标题样式 */
.title{
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 40px;
    text-align: center;
}

/* 添加按钮样式 */
.btn-item{
    margin-top: 20px;
}

/* 按钮尺寸 */
.btn-item .el-button{
    width: 100%;
    height: 50px;
    font-size: 18px;
}

/* 输入框样式 */
.custom-input{
    width: 100%;
}

/* 为输入框添加更大的高度 */
.custom-input .el-button__wrapper{
    height: 48px;
    font-size: 16px;
}

/*  */
.el-form-item__label{
    font-size: 16px;
    font-size: 500;
}
    
</style>