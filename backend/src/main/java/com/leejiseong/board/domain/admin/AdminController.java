package com.leejiseong.board.domain.admin;

import com.leejiseong.board.domain.comment.dto.CommentResponse;
import com.leejiseong.board.domain.member.dto.MemberResponse;
import com.leejiseong.board.domain.member.dto.MemberRoleUpdateRequest;
import com.leejiseong.board.domain.post.dto.PostResponse;
import com.leejiseong.board.global.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // 통계 대시보드
    @GetMapping("/stats")
    public ApiResponse<Map<String, Long>> getStats() {
        return ApiResponse.ok(adminService.getStats());
    }

    // 회원 목록 조회
    @GetMapping("/members")
    public ApiResponse<List<MemberResponse>> getMembers() {
        return ApiResponse.ok(adminService.findAllMembers());
    }

    // 회원 권한 변경
    @PatchMapping("/members/{memberId}/role")
    public ApiResponse<MemberResponse> updateRole(@PathVariable Long memberId,
                                                   @Valid @RequestBody MemberRoleUpdateRequest req) {
        return ApiResponse.ok(adminService.updateMemberRole(memberId, req));
    }

    // 전체 게시글 목록 조회 (관리자용)
    @GetMapping("/posts")
    public ApiResponse<List<PostResponse>> getPosts() {
        return ApiResponse.ok(adminService.findAllPosts());
    }

    // 게시글 강제 삭제
    @DeleteMapping("/posts/{postId}")
    public ApiResponse<Void> deletePost(@PathVariable Long postId) {
        adminService.deletePost(postId);
        return ApiResponse.ok(null);
    }

    // 전체 댓글 목록 조회
    @GetMapping("/comments")
    public ApiResponse<List<CommentResponse>> getComments() {
        return ApiResponse.ok(adminService.findAllComments());
    }

    // 댓글 강제 삭제
    @DeleteMapping("/comments/{commentId}")
    public ApiResponse<Void> deleteComment(@PathVariable Long commentId) {
        adminService.deleteComment(commentId);
        return ApiResponse.ok(null);
    }
}
