package com.leejiseong.board.domain.chat;

import com.leejiseong.board.global.ApiResponse;
import com.leejiseong.board.global.jwt.JwtTokenProvider;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final JwtTokenProvider jwtTokenProvider;

    public ChatController(ChatMessageRepository chatMessageRepository,
                          SimpMessagingTemplate messagingTemplate,
                          JwtTokenProvider jwtTokenProvider) {
        this.chatMessageRepository = chatMessageRepository;
        this.messagingTemplate = messagingTemplate;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    /**
     * WebSocket 메시지 수신
     * 클라이언트가 /app/chat/{roomId} 로 메시지를 보내면
     * /topic/chat/{roomId} 구독자들에게 브로드캐스트
     */
    @MessageMapping("/chat/{roomId}")
    public void handleMessage(
            @DestinationVariable String roomId,
            @Payload ChatMessageDto.SendRequest req,
            org.springframework.messaging.simp.stomp.StompHeaderAccessor headerAccessor
    ) {
        // WebSocket 핸드셰이크 시 저장한 사용자 정보 꺼내기
        String senderId = (String) headerAccessor.getSessionAttributes().get("memberId");
        String senderNickname = (String) headerAccessor.getSessionAttributes().get("nickname");

        if (senderId == null || req.getContent() == null || req.getContent().isBlank()) return;

        ChatMessage msg = new ChatMessage(
                roomId,
                Long.parseLong(senderId),
                senderNickname,
                req.getContent().trim()
        );
        chatMessageRepository.save(msg);

        // 구독자에게 브로드캐스트
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, new ChatMessageDto(msg));
    }

    /**
     * REST: 채팅방 이전 메시지 조회
     * GET /api/chat/{roomId}/messages
     */
    @GetMapping("/api/chat/{roomId}/messages")
    public ApiResponse<List<ChatMessageDto>> getMessages(@PathVariable String roomId) {
        List<ChatMessageDto> messages = chatMessageRepository
                .findTop100ByRoomIdOrderBySentAtAsc(roomId)
                .stream()
                .map(ChatMessageDto::new)
                .toList();
        return ApiResponse.ok(messages);
    }
}
