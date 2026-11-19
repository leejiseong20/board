package com.leejiseong.board.global.config;

import com.leejiseong.board.global.jwt.JwtTokenProvider;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.*;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtTokenProvider jwtTokenProvider;

    public WebSocketConfig(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .addInterceptors(new HandshakeInterceptor() {
                    @Override
                    public boolean beforeHandshake(ServerHttpRequest request,
                                                   ServerHttpResponse response,
                                                   WebSocketHandler wsHandler,
                                                   Map<String, Object> attributes) {
                        // URL 쿼리 파라미터에서 token 추출
                        // ws://localhost:8080/ws?token=xxx
                        String query = request.getURI().getQuery();
                        if (query != null) {
                            for (String param : query.split("&")) {
                                String[] kv = param.split("=", 2);
                                if (kv.length == 2 && kv[0].equals("token")) {
                                    String token = kv[1];
                                    try {
                                        if (jwtTokenProvider.validateToken(token)) {
                                            String email = jwtTokenProvider.getEmailFromToken(token);
                                            // JwtTokenProvider에서 nickname claim 추출
                                            String nickname = jwtTokenProvider.getNicknameFromToken(token);
                                            String memberId = jwtTokenProvider.getMemberIdFromToken(token);
                                            attributes.put("email", email);
                                            attributes.put("nickname", nickname);
                                            attributes.put("memberId", memberId);
                                        }
                                    } catch (Exception ignored) {}
                                }
                            }
                        }
                        return true;
                    }

                    @Override
                    public void afterHandshake(ServerHttpRequest request,
                                               ServerHttpResponse response,
                                               WebSocketHandler wsHandler,
                                               Exception exception) {}
                })
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 클라이언트 → 서버: /app/...
        registry.setApplicationDestinationPrefixes("/app");
        // 서버 → 클라이언트: /topic/...
        registry.enableSimpleBroker("/topic");
    }
}
