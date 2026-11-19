import api from "./axios";

// 채팅방 이전 메시지 조회
export const getChatMessages = (roomId) =>
  api.get(`/api/chat/${roomId}/messages`);

// 채팅방 ID 생성 (두 memberId 중 작은 것이 앞)
export const buildRoomId = (idA, idB) =>
  `${Math.min(idA, idB)}_${Math.max(idA, idB)}`;
