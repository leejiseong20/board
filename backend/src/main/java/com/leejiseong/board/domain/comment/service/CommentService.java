package com.leejiseong.board.domain.comment.service;

import com.leejiseong.board.domain.comment.Comment;
import com.leejiseong.board.domain.comment.dto.CommentCreateRequest;
import com.leejiseong.board.domain.comment.dto.CommentResponse;
import com.leejiseong.board.domain.comment.dto.CommentUpdateRequest;
import com.leejiseong.board.domain.comment.repository.CommentRepository;
import com.leejiseong.board.domain.member.Member;
import com.leejiseong.board.domain.member.repository.MemberRepository;
import com.leejiseong.board.domain.post.Post;
import com.leejiseong.board.domain.post.repository.PostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final MemberRepository memberRepository;

    public CommentService(CommentRepository commentRepository,
                          PostRepository postRepository,
                          MemberRepository memberRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.memberRepository = memberRepository;
    }

    public Long create(Long postId, CommentCreateRequest req, String email) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다. id=" + postId));

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        Comment comment = new Comment(req.getContent(), post, member);
        Long savedId = commentRepository.save(comment).getId();

        post.increaseCommentCount();

        return savedId;
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> findByPost(Long postId) {
        return commentRepository.findByPostIdOrderByIdAsc(postId)
                .stream()
                .map(CommentResponse::from)
                .toList();
    }

    public CommentResponse update(Long commentId, CommentUpdateRequest req, String email) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 없습니다. id=" + commentId));

        if (comment.getWriter() == null || !comment.getWriter().getEmail().equals(email)) {
            throw new SecurityException("본인이 작성한 댓글만 수정할 수 있습니다.");
        }

        comment.update(req.getContent());
        return CommentResponse.from(comment);
    }

    public void delete(Long commentId, String email) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 없습니다. id=" + commentId));

        if (comment.getWriter() == null || !comment.getWriter().getEmail().equals(email)) {
            throw new SecurityException("본인이 작성한 댓글만 삭제할 수 있습니다.");
        }

        Post post = comment.getPost();

        commentRepository.delete(comment);
        post.decreaseCommentCount();
    }
}