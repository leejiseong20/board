package com.leejiseong.board.domain.chat;

import java.time.LocalDateTime;

public class ChatMessageDto {

    private String roomId;
    private Long senderId;
    private String senderNickname;
    private String content;
    private String sentAt;

    public ChatMessageDto() {}

    public ChatMessageDto(ChatMessage msg) {
        this.roomId = msg.getRoomId();
        this.senderId = msg.getSenderId();
        this.senderNickname = msg.getSenderNickname();
        this.content = msg.getContent();
        this.sentAt = msg.getSentAt().toString();
    }

    // 클라이언트에서 보내는 메시지용
    public static class SendRequest {
        private String content;
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    public String getRoomId() { return roomId; }
    public Long getSenderId() { return senderId; }
    public String getSenderNickname() { return senderNickname; }
    public String getContent() { return content; }
    public String getSentAt() { return sentAt; }

    public void setRoomId(String roomId) { this.roomId = roomId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    public void setSenderNickname(String senderNickname) { this.senderNickname = senderNickname; }
    public void setContent(String content) { this.content = content; }
    public void setSentAt(String sentAt) { this.sentAt = sentAt; }
}
