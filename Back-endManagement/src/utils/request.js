import axios from 'axios';
import { ElMessage, ElLoading } from 'element-plus';

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 后端API基础地址（从环境变量读取）
  timeout: 5000, // 请求超时时间（可根据需求调整）
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
});

// 全局加载实例（避免重复创建）
let loadingInstance = null;

/**
 * 打开加载动画（封装逻辑，防止重复调用）
 * @param {Object} config - 请求配置
 */
const openLoading = (config) => {
  // 只有配置允许加载，且当前无加载实例时才创建
  if (config.showLoading !== false && !loadingInstance) {
    loadingInstance = ElLoading.service({
      lock: false,
      text: '加载中...',
      background: 'rgba(255,255,255,0.7)',
      fullscreen: true // 全屏加载（也可指定target元素）
    });
  }
};

/**
 * 关闭加载动画（封装逻辑，防止重复关闭）
 */
const closeLoading = () => {
  if (loadingInstance) {
    loadingInstance.close();
    loadingInstance = null; // 重置实例，避免内存泄漏
  }
};

// ===================== 请求拦截器 =====================
service.interceptors.request.use(
  (config) => {
    // 1. 添加登录Token（登录后存储在localStorage，格式根据后端要求调整）
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // JWT Token格式
    }

    // 2. 控制全局加载状态
    openLoading(config);

    return config;
  },
  (error) => {
    // 请求发送失败时，立即关闭加载
    closeLoading();
    ElMessage.error(`请求发送失败：${error.message || '网络异常'}`);
    return Promise.reject(error);
  }
);

// ===================== 响应拦截器 =====================
service.interceptors.response.use(
  (response) => {
    // 响应成功，关闭加载
    closeLoading();

    const res = response.data;
    // 后端返回的业务状态码（根据实际后端约定调整，比如code=200为成功）
    if (res.code !== 200) {
      // 业务错误提示
      ElMessage.error(res.message || '操作失败，请重试');
      // 抛出自定义错误，便于业务层捕获处理
      return Promise.reject(new Error(res.message || '接口请求失败'));
    }

    // 成功返回数据（直接返回res.data，简化业务层取值；若后端无data字段，可返回res）
    return res;
  },
  (error) => {
    // 响应失败（网络错误、超时、404/500等），关闭加载
    closeLoading();

    // 分类处理错误
    let errorMsg = '';
    if (error.response) {
      // 后端返回的错误（有响应）
      const status = error.response.status;
      switch (status) {
        case 401:
          errorMsg = '登录已过期，请重新登录';
          // 可在此处跳转到登录页
          localStorage.removeItem('admin_token');
          window.location.href = '/login';
          break;
        case 403:
          errorMsg = '暂无权限访问该资源';
          break;
        case 404:
          errorMsg = '请求的接口不存在';
          break;
        case 500:
          errorMsg = '服务器内部错误，请稍后重试';
          break;
        default:
          errorMsg = error.response.data?.message || '请求失败';
      }
    } else if (error.request) {
      // 请求已发送但无响应（网络超时等）
      errorMsg = '网络异常，请检查网络连接';
    } else {
      // 其他错误
      errorMsg = error.message || '请求异常';
    }

    // 统一错误提示
    ElMessage.error(errorMsg);
    return Promise.reject(error);
  }
);

export default service;