import service from '../utils/request.js'; // 路径根据你的项目结构调整

/**
 * 获取用户列表（分页）
 * @param {Object} params - 分页/筛选参数（pageNum, pageSize, status等）
 */
export const fetchUserList = async (params) => {
  return service({
    url: '/api/v1/user/page',
    method: 'GET',
    params,
    showLoading: false // 关闭全局加载（用组件内的loading）
  });
};

/**
 * 搜索用户（按关键词）
 * @param {Object} params - 搜索参数（username/phone/email + 分页参数）
 */
export const searchUsers = async (params) => {
  return service({
    url: '/api/v1/user/search',
    method: 'GET',
    params,
    showLoading: false // 关闭全局加载
  });
};

/**
 * 添加用户
 * @param {Object} data - 用户信息（username, phone, email等）
 */
export const addUser = async (data) => {
  return service({
    url: '/api/v1/user/add',
    method: 'POST',
    data,
    showLoading: true // 开启全局加载
  });
};

/**
 * 编辑用户
 * @param {Number} id - 用户ID
 * @param {Object} data - 更新的用户信息
 */
export const updateUser = async (userData) => {
  return service({
    url: `/api/v1/user/${userData.id}`,
    method: 'PUT',
    data: userData,
    showLoading: true
  });
};

/**
 * 删除用户
 * @param {Number} id - 用户ID
 */
export const deleteUser = async (id) => {
  return service({
    url: `/api/v1/user/${id}`,
    method: 'DELETE',
    showLoading: true
  });
};

/**
 * 批量删除用户
 * @param {Array} ids - 用户ID数组
 */
export const batchDeleteUsers = async (ids) => {
  return service({
    url: '/api/v1/user/batch',
    method: 'DELETE',
    data: { ids }, // 注意是data传参（POST/PUT/DELETE的body）
    showLoading: true
  });
};

/**
 * 更新用户状态（启用/禁用）
 * @param {Number} id - 用户ID
 * @param {Number} status - 状态（1=启用，0=禁用）
 */
export const updateUserStatus = async (id, status) => {
  return service({
    url: `/api/v1/user/${id}/status`,
    method: 'PATCH',
    data: { status },
    showLoading: true
  });
};

/**
 * 重置用户密码
 * @param {Number} id - 用户ID
 */
export const resetUserPassword = async (id) => {
  return service({
    url: `/api/v1/user/${id}/reset-pwd`,
    method: 'POST',
    showLoading: true
  });
};