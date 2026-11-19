package com.leejiseong.board.domain.friend;

import com.leejiseong.board.global.ApiResponse;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    private final FriendService friendService;

    public FriendController(FriendService friendService) {
        this.friendService = friendService;
    }

    // 친구 요청 보내기
    @PostMapping("/request/{targetMemberId}")
    public ApiResponse<Void> sendRequest(@PathVariable Long targetMemberId,
                                         Authentication auth) {
        friendService.sendRequest(auth.getName(), targetMemberId);
        return ApiResponse.ok(null);
    }

    // 친구 요청 수락
    @PostMapping("/accept/{friendshipId}")
    public ApiResponse<Void> accept(@PathVariable Long friendshipId,
                                    Authentication auth) {
        friendService.acceptRequest(auth.getName(), friendshipId);
        return ApiResponse.ok(null);
    }

    // 친구 요청 거절 / 친구 삭제
    @DeleteMapping("/{friendshipId}")
    public ApiResponse<Void> delete(@PathVariable Long friendshipId,
                                    Authentication auth) {
        friendService.deleteFriendship(auth.getName(), friendshipId);
        return ApiResponse.ok(null);
    }

    // 받은 친구 요청 목록
    @GetMapping("/requests")
    public ApiResponse<List<Map<String, Object>>> getPendingRequests(Authentication auth) {
        return ApiResponse.ok(friendService.getPendingRequests(auth.getName()));
    }

    // 친구 목록
    @GetMapping
    public ApiResponse<List<Map<String, Object>>> getFriends(Authentication auth) {
        return ApiResponse.ok(friendService.getFriends(auth.getName()));
    }
}
