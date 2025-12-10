// 导入你项目的axios实例（比如request）
import request from '../utils/request';

// 根据帖子ID查标签ID列表
export function getTagIdsByPostId(postId) {
  return request({
    url: `/api/v1/post-tag/post/${postId}`,
    method: 'get'
  });
}

// 保存帖子-标签关联（新增/编辑）
export function savePostTagRelation(data) {
  return request({
    url: '/api/v1/post-tag/save',
    method: 'post',
    data
  });
}