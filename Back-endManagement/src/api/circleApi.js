// 模拟的圈子数据
let mockCircles = [
  {
    id: 1,
    name: 'Vue.js 技术交流圈',
    description: '专注于 Vue.js 框架的学习与交流',
    founder: '张三',
    memberCount: 256,
    status: 'active',
    createTime: '2024-01-15',
  },
  {
    id: 2,
    name: '前端性能优化圈',
    description: '探讨前端性能瓶颈及优化方案',
    founder: '李四',
    memberCount: 189,
    status: 'active',
    createTime: '2024-02-20',
  },
  {
    id: 3,
    name: 'UI/UX 设计分享圈',
    description: '分享 UI/UX 设计理念、工具和作品',
    founder: '王五',
    memberCount: 132,
    status: 'active',
    createTime: '2024-03-10',
  },
  {
    id: 4,
    name: 'React 生态研究圈',
    description: '深入讨论 React 及其周边生态',
    founder: '赵六',
    memberCount: 98,
    status: 'inactive',
    createTime: '2024-01-25',
  },
  {
    id: 5,
    name: 'Flutter 跨平台开发',
    description: '交流 Flutter 跨平台应用开发经验',
    founder: '孙七',
    memberCount: 210,
    status: 'active',
    createTime: '2024-04-05',
  },
];

// 模拟状态数据
export const statuses = [
  { label: '活跃', value: 'active' },
  { label: '非活跃', value: 'inactive' },
];

// 模拟异步请求
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 获取圈子列表
export const fetchCircles = async (params = {}) => {
  await delay(500);

  let filteredCircles = [...mockCircles];

  // 模拟筛选逻辑
  if (params.name) {
    filteredCircles = filteredCircles.filter(circle => 
      circle.name.includes(params.name)
    );
  }
  if (params.status) {
    filteredCircles = filteredCircles.filter(circle => 
      circle.status === params.status
    );
  }
  if (params.dateRange && params.dateRange.length === 2) {
    const startDate = new Date(params.dateRange[0]);
    const endDate = new Date(params.dateRange[1]);
    filteredCircles = filteredCircles.filter(circle => {
      const circleDate = new Date(circle.createTime);
      return circleDate >= startDate && circleDate <= endDate;
    });
  }
  
  // 模拟分页逻辑
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const total = filteredCircles.length;
  const paginatedCircles = filteredCircles.slice((page - 1) * pageSize, page * pageSize);

  return {
    circles: paginatedCircles,
    total,
  };
};

// 获取单个圈子
export const fetchCircleById = async (id) => {
  await delay(300);
  return mockCircles.find(circle => circle.id === id) || null;
};

// 创建新圈子
export const createCircle = async (circleData) => {
  await delay(500);
  const newCircle = {
    id: Date.now(),
    founder: '当前登录用户', // 在真实项目中，这应该从登录状态获取
    memberCount: 1, // 创建者自动成为第一个成员
    createTime: new Date().toISOString().split('T')[0],
    ...circleData,
  };
  mockCircles.unshift(newCircle);
  return newCircle;
};

// 更新圈子
export const updateCircle = async (id, updatedData) => {
  await delay(500);
  const index = mockCircles.findIndex(circle => circle.id === id);
  if (index !== -1) {
    mockCircles[index] = { ...mockCircles[index], ...updatedData };
    return mockCircles[index];
  }
  throw new Error('圈子不存在');
};

// 删除圈子
export const deleteCircle = async (id) => {
  await delay(300);
  const initialLength = mockCircles.length;
  mockCircles = mockCircles.filter(circle => circle.id !== id);
  return initialLength > mockCircles.length;
};