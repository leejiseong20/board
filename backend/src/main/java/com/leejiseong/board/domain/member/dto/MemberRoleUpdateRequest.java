package com.leejiseong.board.domain.member.dto;

import jakarta.validation.constraints.NotBlank;

public class MemberRoleUpdateRequest {

    @NotBlank
    private String role; // "USER" or "ADMIN"

    public String getRole() { return role; }
}
