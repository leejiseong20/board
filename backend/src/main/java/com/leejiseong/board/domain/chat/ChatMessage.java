package com.leejiseong.board.domain.chat;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 채팅방 ID: 두 사람의 memberId를 정렬해서 만든 고유 키
    // ex) memberId 3번과 7번 → "3_7"
    @Column(nullable = false, length = 50)
    private String roomId;

    @Column(nullable = false)
    private Long senderId;

    @Column(nullable = false, length = 30)
    private String senderNickname;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private LocalDateTime sentAt;

    protected ChatMessage() {}

    public ChatMessage(String roomId, Long senderId, String senderNickname, String content) {
        this.roomId = roomId;
        this.senderId = senderId;
        this.senderNickname = senderNickname;
        this.content = content;
        this.sentAt = LocalDateTime.now();
    }

    // 두 memberId로 채팅방 ID 생성 (항상 작은 ID가 앞에 오도록 정렬)
    public static String buildRoomId(Long idA, Long idB) {
        return Math.min(idA, idB) + "_" + Math.max(idA, idB);
    }

    public Long getId() { return id; }
    public String getRoomId() { return roomId; }
    public Long getSenderId() { return senderId; }
    public String getSenderNickname() { return senderNickname; }
    public String getContent() { return content; }
    public LocalDateTime getSentAt() { return sentAt; }
}
