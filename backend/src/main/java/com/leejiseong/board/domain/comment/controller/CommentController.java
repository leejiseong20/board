package com.leejiseong.board.domain.comment.controller;

import com.leejiseong.board.domain.comment.dto.CommentCreateRequest;
import com.leejiseong.board.domain.comment.dto.CommentResponse;
import com.leejiseong.board.domain.comment.dto.CommentUpdateRequest;
import com.leejiseong.board.domain.comment.service.CommentService;
import com.leejiseong.board.global.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public ApiResponse<Long> create(@PathVariable Long postId,
                                    @Valid @RequestBody CommentCreateRequest req,
                                    Authentication authentication) {
        String email = authentication.getName();
        return ApiResponse.ok(commentService.create(postId, req, email));
    }

    @GetMapping
    public ApiResponse<List<CommentResponse>> list(@PathVariable Long postId) {
        return ApiResponse.ok(commentService.findByPost(postId));
    }

    @PutMapping("/{commentId}")
    public ApiResponse<CommentResponse> update(@PathVariable Long postId,
                                               @PathVariable Long commentId,
                                               @Valid @RequestBody CommentUpdateRequest req,
                                               Authentication authentication) {
        String email = authentication.getName();
        return ApiResponse.ok(commentService.update(commentId, req, email));
    }

    @DeleteMapping("/{commentId}")
    public ApiResponse<Void> delete(@PathVariable Long postId,
                                    @PathVariable Long commentId,
                                    Authentication authentication) {
        String email = authentication.getName();
        commentService.delete(commentId, email);
        return ApiResponse.ok(null);
    }
}