package com.leejiseong.board.domain.post.dto;

import com.leejiseong.board.domain.post.Post;

import java.time.LocalDateTime;

public class PostResponse {

    private Long id;
    private String title;
    private String content;
    private Long writerId;
    private String writerNickname;
    private int viewCount;
    private int likeCount;
    private int commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public PostResponse(Long id,
                        String title,
                        String content,
                        Long writerId,
                        String writerNickname,
                        int viewCount,
                        int likeCount,
                        int commentCount,
                        LocalDateTime createdAt,
                        LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.writerId = writerId;
        this.writerNickname = writerNickname;
        this.viewCount = viewCount;
        this.likeCount = likeCount;
        this.commentCount = commentCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static PostResponse from(Post post) {
        Long writerId = null;
        String writerNickname = null;
        if (post.getWriter() != null) {
            writerId = post.getWriter().getId();
            writerNickname = post.getWriter().getNickname();
        }

        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                writerId,
                writerNickname,
                post.getViewCount(),
                post.getLikeCount(),
                post.getCommentCount(),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public Long getWriterId() { return writerId; }
    public String getWriterNickname() { return writerNickname; }
    public int getViewCount() { return viewCount; }
    public int getLikeCount() { return likeCount; }
    public int getCommentCount() { return commentCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
