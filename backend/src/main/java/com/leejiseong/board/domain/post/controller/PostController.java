package com.leejiseong.board.domain.post.controller;

import com.leejiseong.board.domain.post.dto.PostCreateRequest;
import com.leejiseong.board.domain.post.dto.PostLikeStatusResponse;
import com.leejiseong.board.domain.post.dto.PostResponse;
import com.leejiseong.board.domain.post.dto.PostUpdateRequest;
import com.leejiseong.board.domain.post.service.PostService;
import com.leejiseong.board.global.ApiResponse;
import com.leejiseong.board.global.PageResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private static final int VIEW_COOKIE_MAX_AGE = 60 * 60 * 24;

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    public ApiResponse<Long> create(@Valid @RequestBody PostCreateRequest req,
                                    Authentication authentication) {
        String email = authentication.getName();
        return ApiResponse.ok(postService.create(req, email));
    }

    @GetMapping
    public ApiResponse<PageResponse<PostResponse>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "latest") String sortBy
    ) {
        if (keyword != null) {
            keyword = keyword.trim();
        }

        if (keyword != null && !keyword.isBlank() && keyword.length() < 2) {
            throw new IllegalArgumentException("검색어는 2글자 이상 입력하세요.");
        }

        int safeSize = Math.min(size, 50);

        Sort sort = switch (sortBy) {
            case "views" -> Sort.by(Sort.Direction.DESC, "viewCount")
                    .and(Sort.by(Sort.Direction.DESC, "id"));
            case "likes" -> Sort.by(Sort.Direction.DESC, "likeCount")
                    .and(Sort.by(Sort.Direction.DESC, "id"));
            case "latest" -> Sort.by(Sort.Direction.DESC, "id");
            default -> throw new IllegalArgumentException("지원하지 않는 정렬 방식입니다.");
        };

        Pageable pageable = PageRequest.of(page, safeSize, sort);

        return ApiResponse.ok(PageResponse.from(postService.findPage(keyword, pageable)));
    }

    @GetMapping("/{id}")
    public ApiResponse<PostResponse> detail(@PathVariable Long id) {
        return ApiResponse.ok(postService.findOne(id));
    }

    @PostMapping("/{id}/view")
    public ApiResponse<Void> increaseView(@PathVariable Long id,
                                          HttpServletRequest request,
                                          HttpServletResponse response) {
        String cookieName = buildViewCookieName(id);

        if (!hasCookie(request, cookieName)) {
            postService.increaseView(id);
            addViewCookie(response, cookieName);
        }

        return ApiResponse.ok(null);
    }

    @PostMapping("/{id}/like")
    public ApiResponse<Void> like(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        postService.like(id, email);
        return ApiResponse.ok(null);
    }

    @DeleteMapping("/{id}/like")
    public ApiResponse<Void> unlike(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        postService.unlike(id, email);
        return ApiResponse.ok(null);
    }

    @GetMapping("/{id}/like-status")
    public ApiResponse<PostLikeStatusResponse> likeStatus(@PathVariable Long id,
                                                          Authentication authentication) {
        String email = authentication.getName();
        return ApiResponse.ok(postService.getLikeStatus(id, email));
    }

    @PutMapping("/{id}")
    public ApiResponse<PostResponse> update(@PathVariable Long id,
                                            @Valid @RequestBody PostUpdateRequest req,
                                            Authentication authentication) {
        String email = authentication.getName();
        return ApiResponse.ok(postService.update(id, req, email));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id,
                                    Authentication authentication) {
        String email = authentication.getName();
        postService.delete(id, email);
        return ApiResponse.ok(null);
    }

    private String buildViewCookieName(Long postId) {
        return "viewed_post_" + postId;
    }

    private boolean hasCookie(HttpServletRequest request, String cookieName) {
        jakarta.servlet.http.Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            return false;
        }

        for (jakarta.servlet.http.Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName())) {
                return true;
            }
        }

        return false;
    }

    private void addViewCookie(HttpServletResponse response, String cookieName) {
        String cookieValue = cookieName + "=true; Path=/; Max-Age=" + VIEW_COOKIE_MAX_AGE + "; SameSite=Lax";
        response.addHeader("Set-Cookie", cookieValue);
    }
}