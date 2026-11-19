package com.leejiseong.board.domain.comment.dto;

import com.leejiseong.board.domain.comment.Comment;

import java.time.LocalDateTime;

public class CommentResponse {

    private Long id;
    private String content;
    private Long writerId;
    private String writerNickname;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CommentResponse(Long id, String content, Long writerId, String writerNickname,
                           LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.content = content;
        this.writerId = writerId;
        this.writerNickname = writerNickname;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static CommentResponse from(Comment comment) {
        Long writerId = null;
        String writerNickname = null;
        if (comment.getWriter() != null) {
            writerId = comment.getWriter().getId();
            writerNickname = comment.getWriter().getNickname();
        }

        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                writerId,
                writerNickname,
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }

    public Long getId() { return id; }
    public String getContent() { return content; }
    public Long getWriterId() { return writerId; }
    public String getWriterNickname() { return writerNickname; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
