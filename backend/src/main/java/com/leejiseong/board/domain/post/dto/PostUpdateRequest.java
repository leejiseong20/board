package com.leejiseong.board.domain.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PostUpdateRequest {

    @NotBlank
    @Size(max = 120)
    private String title;

    @NotBlank
    private String content;

    public PostUpdateRequest() {}

    public String getTitle() { return title; }
    public String getContent() { return content; }
}