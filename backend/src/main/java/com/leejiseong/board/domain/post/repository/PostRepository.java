package com.leejiseong.board.domain.post.repository;

import com.leejiseong.board.domain.post.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    // 게시글 목록 페이징 - writer fetch join으로 N+1 방지
    @Query("SELECT p FROM Post p JOIN FETCH p.writer")
    Page<Post> findAllWithWriter(Pageable pageable);

    // 키워드 검색 + writer fetch join
    @Query("SELECT p FROM Post p JOIN FETCH p.writer WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Post> findByTitleWithWriter(@Param("keyword") String keyword, Pageable pageable);

    // 관리자용 전체 게시글 조회
    @Query("SELECT p FROM Post p JOIN FETCH p.writer ORDER BY p.id DESC")
    List<Post> findAllWithWriterForAdmin();

    // 내가 쓴 글 조회 (memberId 기준, 최신순)
    @Query("SELECT p FROM Post p JOIN FETCH p.writer WHERE p.writer.id = :memberId ORDER BY p.id DESC")
    Page<Post> findByWriterIdWithWriter(@Param("memberId") Long memberId, Pageable pageable);
}
