import api from "./axios";

export const getMe = () => api.get("/api/members/me");

export const getMyPosts = (page = 0, size = 10) =>
  api.get("/api/members/me/posts", { params: { page, size } });

export const updateNickname = (nickname) =>
  api.patch("/api/members/me/nickname", { nickname });

export const updatePassword = (currentPassword, newPassword, confirmNewPassword) =>
  api.patch("/api/members/me/password", {
    currentPassword,
    newPassword,
    confirmNewPassword,
  });
