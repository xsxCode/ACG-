import request from '../utils/request';

export const tagApi = {
  // 获取标签列表（明确传递所有参数）
  getTagList: (params) => {
    return request({
      url: '/api/v1/tag/all', // 确认后端接口地址正确
      method: 'GET', // 明确请求方式为GET
      params, // 包含 keyword、pageNum、pageSize
      showLoading: true
    });
  },
  addTag: (data) => {
    return request({
      url: '/api/v1/tag/add',
      method: 'POST',
      data,
      showLoading: true
    });
  },
  editTag: (data) => {
    return request({
      url: '/api/v1/tag/edit',
      method: 'POST',
      data,
      showLoading: true
    });
  },
  deleteTag: (id) => {
    return request({
      url: `/api/v1/tag/delete/${id}`,
      method: 'DELETE',
      showLoading: true
    });
  }
};

// 标签分页查询（仅这一个接口，无其他）
export const fetchTags = async (params) => {
  return service({
    url: '/api/v1/tag/page',
    method: 'GET',
    params,
    showLoading: false
  });
};