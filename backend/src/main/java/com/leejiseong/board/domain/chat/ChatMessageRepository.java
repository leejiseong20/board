package com.leejiseong.board.domain.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // 특정 채팅방의 최근 메시지 100개 조회 (오래된 순)
    List<ChatMessage> findTop100ByRoomIdOrderBySentAtAsc(String roomId);
}
