package com.leejiseong.board.domain.auth.dto;

public class LoginResponse {

    private final String accessToken;
    private final String role;
    private final String nickname;
    private final Long memberId;

    public LoginResponse(String accessToken, String role, String nickname, Long memberId) {
        this.accessToken = accessToken;
        this.role = role;
        this.nickname = nickname;
        this.memberId = memberId;
    }

    public String getAccessToken() { return accessToken; }
    public String getRole() { return role; }
    public String getNickname() { return nickname; }
    public Long getMemberId() { return memberId; }
}
