import request from '@/utils/request';

// 注意：后端没返回status字段，先给默认值"active"，后续可让后端补充
export const statuses = [
  { label: '活跃', value: 'active' },
  { label: '非活跃', value: 'inactive' }
];

/**
 * 获取圈子列表（适配后端实际返回字段）
 */
export const fetchCircles = async (params) => {
  try {
    const res = await request({
      url: '/api/v1/circle/all',
      method: 'get',
      params: {
        name: params.name || '',
        // 后端没返回status，暂时注释status筛选（后续后端加了再放开）
        // status: params.status || '',
        startDate: params.dateRange?.[0] || '',
        endDate: params.dateRange?.[1] || '',
        page: params.page || 1,
        pageSize: params.pageSize || 10
      }
    });
    // 关键：适配后端返回格式（重点！）
    return {
      // 后端返回的列表如果是直接数组，就用res.data；如果是分页对象，用res.data.records
      // 先按最常见的分页格式，若不行再改成 circles: res.data || []
      circles: res.data.records || res.data || [],
      total: res.data.total || (res.data?.length || 0)
    };
  } catch (error) {
    console.error('获取圈子列表失败:', error);
    throw new Error(error.response?.data?.msg || '网络异常，请重试');
  }
};

// 其他接口（fetchCircleById/createCircle/updateCircle/deleteCircle）保持不变
export const fetchCircleById = async (id) => {
  try {
    const res = await request({
      url: `/api/v1/circle/${id}`,
      method: 'get'
    });
    return res.data || {};
  } catch (error) {
    console.error('获取圈子详情失败:', error);
    throw new Error(error.response?.data?.msg || '获取圈子详情失败');
  }
};

export const createCircle = async (data) => {
  try {
    const res = await request({
      url: '/api/v1/circle',
      method: 'post',
      data: {
        name: data.name,
        description: data.description,
        // 后端若需要status，补充进去；暂时注释
        // status: data.status || 'active'
      }
    });
    return res.data;
  } catch (error) {
    console.error('创建圈子失败:', error);
    throw new Error(error.response?.data?.msg || '创建圈子失败');
  }
};

export const updateCircle = async (id, data) => {
  try {
    const res = await request({
      url: `/api/v1/circle/${id}`,
      method: 'put',
      data: {
        name: data.name,
        description: data.description,
        // status: data.status
      }
    });
    return res.data;
  } catch (error) {
    console.error('更新圈子失败:', error);
    throw new Error(error.response?.data?.msg || '更新圈子失败');
  }
};

export const deleteCircle = async (id) => {
  try {
    await request({
      url: `/api/v1/circle/${id}`,
      method: 'delete'
    });
    return true;
  } catch (error) {
    console.error('删除圈子失败:', error);
    throw new Error(error.response?.data?.msg || '删除圈子失败');
  }
};