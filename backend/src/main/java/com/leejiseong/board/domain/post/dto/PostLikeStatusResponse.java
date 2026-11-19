package com.leejiseong.board.domain.post.dto;

public class PostLikeStatusResponse {

    private boolean liked;
    private int likeCount;

    public PostLikeStatusResponse(boolean liked, int likeCount) {
        this.liked = liked;
        this.likeCount = likeCount;
    }

    public boolean isLiked() {
        return liked;
    }

    public int getLikeCount() {
        return likeCount;
    }
}