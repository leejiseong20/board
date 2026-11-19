package com.leejiseong.board.domain.member;

import com.leejiseong.board.domain.member.dto.MemberResponse;
import com.leejiseong.board.domain.member.dto.NicknameUpdateRequest;
import com.leejiseong.board.domain.member.dto.PasswordUpdateRequest;
import com.leejiseong.board.domain.member.repository.MemberRepository;
import com.leejiseong.board.domain.post.dto.PostResponse;
import com.leejiseong.board.domain.post.service.PostService;
import com.leejiseong.board.global.ApiResponse;
import com.leejiseong.board.global.PageResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members")
public class MemberController {

    private final MemberService memberService;
    private final MemberRepository memberRepository;
    private final PostService postService;

    public MemberController(MemberService memberService,
                            MemberRepository memberRepository,
                            PostService postService) {
        this.memberService = memberService;
        this.memberRepository = memberRepository;
        this.postService = postService;
    }

    // 현재 로그인한 사용자 정보 조회
    @GetMapping("/me")
    public ApiResponse<MemberResponse> getMe(@AuthenticationPrincipal String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
        return ApiResponse.ok(MemberResponse.from(member));
    }

    // 내가 쓴 글 목록
    @GetMapping("/me/posts")
    public ApiResponse<PageResponse<PostResponse>> getMyPosts(
            @AuthenticationPrincipal String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<PostResponse> result = postService.findMyPosts(email, page, size);
        return ApiResponse.ok(PageResponse.from(result));
    }

    // 닉네임으로 회원 검색 (친구 추가용)
    @GetMapping("/search")
    public ApiResponse<MemberResponse> searchByNickname(@RequestParam String nickname) {
        Member member = memberRepository.findByNickname(nickname)
                .orElseThrow(() -> new IllegalArgumentException("해당 닉네임의 회원이 없습니다."));
        return ApiResponse.ok(MemberResponse.from(member));
    }

    @PatchMapping("/me/nickname")
    public ApiResponse<String> updateNickname(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody NicknameUpdateRequest req
    ) {
        String updatedNickname = memberService.updateNickname(email, req);
        return ApiResponse.ok(updatedNickname);
    }

    @PatchMapping("/me/password")
    public ApiResponse<Void> updatePassword(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody PasswordUpdateRequest req
    ) {
        memberService.updatePassword(email, req);
        return ApiResponse.ok(null);
    }
}
