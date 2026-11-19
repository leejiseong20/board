package com.leejiseong.board.domain.friend;

import com.leejiseong.board.domain.member.Member;
import com.leejiseong.board.domain.member.repository.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class FriendService {

    private final FriendshipRepository friendshipRepository;
    private final MemberRepository memberRepository;

    public FriendService(FriendshipRepository friendshipRepository,
                         MemberRepository memberRepository) {
        this.friendshipRepository = friendshipRepository;
        this.memberRepository = memberRepository;
    }

    // 친구 요청 보내기
    @Transactional
    public void sendRequest(String myEmail, Long targetMemberId) {
        Member me = findByEmail(myEmail);
        Member target = findById(targetMemberId);

        if (me.getId().equals(target.getId())) {
            throw new IllegalArgumentException("자기 자신에게 친구 요청을 보낼 수 없습니다.");
        }

        friendshipRepository.findBetween(me, target).ifPresent(f -> {
            throw new IllegalArgumentException(
                f.getStatus() == FriendshipStatus.ACCEPTED
                    ? "이미 친구입니다."
                    : "이미 친구 요청이 존재합니다."
            );
        });

        friendshipRepository.save(new Friendship(me, target));
    }

    // 친구 요청 수락
    @Transactional
    public void acceptRequest(String myEmail, Long friendshipId) {
        Member me = findByEmail(myEmail);
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new IllegalArgumentException("친구 요청이 없습니다."));

        if (!friendship.getReceiver().getId().equals(me.getId())) {
            throw new SecurityException("본인에게 온 요청만 수락할 수 있습니다.");
        }

        friendship.accept();
    }

    // 친구 요청 거절 또는 친구 삭제
    @Transactional
    public void deleteFriendship(String myEmail, Long friendshipId) {
        Member me = findByEmail(myEmail);
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new IllegalArgumentException("친구 관계가 없습니다."));

        boolean isInvolved = friendship.getRequester().getId().equals(me.getId())
                || friendship.getReceiver().getId().equals(me.getId());

        if (!isInvolved) {
            throw new SecurityException("권한이 없습니다.");
        }

        friendshipRepository.delete(friendship);
    }

    // 받은 친구 요청 목록
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPendingRequests(String myEmail) {
        Member me = findByEmail(myEmail);
        return friendshipRepository.findPendingReceived(me).stream()
                .map(f -> Map.of(
                        "friendshipId", (Object) f.getId(),
                        "memberId", f.getRequester().getId(),
                        "nickname", f.getRequester().getNickname(),
                        "createdAt", f.getCreatedAt().toString()
                ))
                .toList();
    }

    // 친구 목록
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getFriends(String myEmail) {
        Member me = findByEmail(myEmail);
        return friendshipRepository.findAcceptedFriends(me).stream()
                .map(f -> {
                    Member friend = f.getRequester().getId().equals(me.getId())
                            ? f.getReceiver()
                            : f.getRequester();
                    return Map.of(
                            "friendshipId", (Object) f.getId(),
                            "memberId", friend.getId(),
                            "nickname", friend.getNickname()
                    );
                })
                .toList();
    }

    private Member findByEmail(String email) {
        return memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));
    }

    private Member findById(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("대상 회원이 존재하지 않습니다."));
    }
}
