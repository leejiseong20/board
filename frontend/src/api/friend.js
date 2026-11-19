import api from "./axios";

// 친구 요청 보내기
export const sendFriendRequest = (targetMemberId) =>
  api.post(`/api/friends/request/${targetMemberId}`);

// 친구 요청 수락
export const acceptFriendRequest = (friendshipId) =>
  api.post(`/api/friends/accept/${friendshipId}`);

// 친구 요청 거절 / 친구 삭제
export const deleteFriendship = (friendshipId) =>
  api.delete(`/api/friends/${friendshipId}`);

// 받은 친구 요청 목록
export const getPendingRequests = () =>
  api.get("/api/friends/requests");

// 친구 목록
export const getFriends = () =>
  api.get("/api/friends");
