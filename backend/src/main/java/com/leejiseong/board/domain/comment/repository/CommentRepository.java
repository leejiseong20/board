package com.leejiseong.board.domain.comment.repository;

import com.leejiseong.board.domain.comment.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPostIdOrderByIdAsc(Long postId);

    void deleteByPostId(Long postId);

    // 관리자용 전체 댓글 조회 - writer, post를 fetch join으로 한 번에 로딩
    @Query("SELECT c FROM Comment c JOIN FETCH c.writer JOIN FETCH c.post ORDER BY c.id DESC")
    List<Comment> findAllWithWriterAndPost();
}