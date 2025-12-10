// src/api/contentApi.js
import request from '../utils/request'; // 假设你有封装好的axios实例（下面会提）

// 1. 获取帖子列表（分页+筛选）
export function fetchPosts(params) {
  return request({
    url: '/api/v1/post/page', // 后端的帖子列表接口地址
    method: 'get',
    params // 包含分页、筛选条件
  });
}

// 2. 批量操作帖子（删除/发布/下架）
export function batchOperatePosts(data) {
  return request({
    url: '/api/v1/post/batch',
    method: 'delete', // 或post，根据后端接口类型调整
    data
  });
}

// 3. 更新帖子状态
export function updatePostStatus(id, status) {
  return request({
    url: `/api/v1/post/${id}/status`,
    method: 'patch',
    params: { status } // 或data，看后端接收方式
  });
}

// 4. 删除单个帖子
export function deletePost(id) {
  return request({
    url: `/api/v1/post/${id}`,
    method: 'delete'
  });
}

// 5. 新增/编辑帖子（后续用）
export function addPost(data) {
  return request({
    url: '/api/v1/post',
    method: 'post',
    data
  });
}
export function editPost(id, data) {
  return request({
    url: `/api/v1/post/${id}`,
    method: 'put',
    data
  });
}

// 新增：获取所有圈子列表
export const fetchCircleList = () => {
  return request({
    url: '/api/v1/circle/all',
    method: 'get'
  });
};

// 新增：获取所有标签列表
export const fetchTagList = () => {
  return request({
    url: '/api/v1/tag/all',
    method: 'get'
  });
};





