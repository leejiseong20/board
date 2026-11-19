package com.leejiseong.board.domain.member.dto;

import com.leejiseong.board.domain.member.Member;

import java.time.LocalDateTime;

public class MemberResponse {

    private Long id;
    private String email;
    private String nickname;
    private String address;
    private String role;
    private LocalDateTime createdAt;

    public MemberResponse(Long id, String email, String nickname, String address, String role, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.nickname = nickname;
        this.address = address;
        this.role = role;
        this.createdAt = createdAt;
    }

    public static MemberResponse from(Member member) {
        return new MemberResponse(
                member.getId(),
                member.getEmail(),
                member.getNickname(),
                member.getAddress(),
                member.getRole().name(),
                member.getCreatedAt()
        );
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getNickname() { return nickname; }
    public String getAddress() { return address; }
    public String getRole() { return role; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
