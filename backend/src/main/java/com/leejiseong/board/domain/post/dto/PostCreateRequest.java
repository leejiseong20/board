package com.leejiseong.board.domain.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PostCreateRequest {

    @NotBlank
    @Size(max = 120)
    private String title;

    @NotBlank
    private String content;

    public PostCreateRequest() {}

    public String getTitle() { return title; }
    public String getContent() { return content; }
}