package com.leejiseong.board.domain.friend;

import com.leejiseong.board.domain.member.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    // 두 사람 사이의 친구 관계 조회 (방향 무관)
    @Query("""
        SELECT f FROM Friendship f
        JOIN FETCH f.requester
        JOIN FETCH f.receiver
        WHERE (f.requester = :a AND f.receiver = :b)
           OR (f.requester = :b AND f.receiver = :a)
    """)
    Optional<Friendship> findBetween(@Param("a") Member a, @Param("b") Member b);

    // 내가 받은 대기 중인 친구 요청 목록
    @Query("""
        SELECT f FROM Friendship f
        JOIN FETCH f.requester
        WHERE f.receiver = :member AND f.status = 'PENDING'
    """)
    List<Friendship> findPendingReceived(@Param("member") Member member);

    // 수락된 친구 목록 (양방향)
    @Query("""
        SELECT f FROM Friendship f
        JOIN FETCH f.requester
        JOIN FETCH f.receiver
        WHERE (f.requester = :member OR f.receiver = :member)
          AND f.status = 'ACCEPTED'
    """)
    List<Friendship> findAcceptedFriends(@Param("member") Member member);
}
