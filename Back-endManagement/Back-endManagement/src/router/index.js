// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'

// 定义路由规则
const routes = [
  { path: '/', redirect: '/login' }, // 首页重定向到登录页
  { path: '/login', component: Login },
  { path: '/register', component: () => import('../views/Register.vue') },
  { path: '/user-manage', component: () => import('../views/UserList.vue') }, // 用户管理
  { path: '/dashboard', component: () => import('../views/Dashboard.vue') }, // 仪表盘
//   { path: '/content-manage', component: () => import('../views/ContentList.vue') }, // 内容管理
//   { path: '/interest-circle', component: () => import('../views/InterestCircle.vue') }, // 兴趣圈子
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router