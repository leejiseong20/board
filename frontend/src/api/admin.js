import api from "./axios";

// 통계 조회
export const fetchStats = () => api.get("/api/admin/stats");

// 회원 목록 조회
export const fetchMembers = () => api.get("/api/admin/members");

// 회원 권한 변경
export const updateMemberRole = (memberId, role) =>
  api.patch(`/api/admin/members/${memberId}/role`, { role });

// 게시글 목록 조회 (관리자 전용)
export const fetchPosts = () => api.get("/api/admin/posts");

// 게시글 강제 삭제
export const deletePostByAdmin = (postId) =>
  api.delete(`/api/admin/posts/${postId}`);

// 댓글 목록 조회
export const fetchComments = () => api.get("/api/admin/comments");

// 댓글 강제 삭제
export const deleteCommentByAdmin = (commentId) =>
  api.delete(`/api/admin/comments/${commentId}`);
