package com.leejiseong.board.domain.admin;

import com.leejiseong.board.domain.comment.Comment;
import com.leejiseong.board.domain.comment.dto.CommentResponse;
import com.leejiseong.board.domain.comment.repository.CommentRepository;
import com.leejiseong.board.domain.member.Member;
import com.leejiseong.board.domain.member.Role;
import com.leejiseong.board.domain.member.dto.MemberResponse;
import com.leejiseong.board.domain.member.dto.MemberRoleUpdateRequest;
import com.leejiseong.board.domain.member.repository.MemberRepository;
import com.leejiseong.board.domain.post.Post;
import com.leejiseong.board.domain.post.dto.PostResponse;
import com.leejiseong.board.domain.post.repository.PostRepository;
import com.leejiseong.board.domain.postlike.repository.PostLikeRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class AdminService {

    private final MemberRepository memberRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;

    public AdminService(MemberRepository memberRepository,
                        PostRepository postRepository,
                        CommentRepository commentRepository,
                        PostLikeRepository postLikeRepository) {
        this.memberRepository = memberRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.postLikeRepository = postLikeRepository;
    }

    // 회원 목록 조회
    @Transactional(readOnly = true)
    public List<MemberResponse> findAllMembers() {
        return memberRepository.findAll()
                .stream()
                .map(MemberResponse::from)
                .toList();
    }

    // 회원 권한 변경
    public MemberResponse updateMemberRole(Long memberId, MemberRoleUpdateRequest req) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다. id=" + memberId));

        Role role = Role.valueOf(req.getRole().toUpperCase());
        member.updateRole(role);

        return MemberResponse.from(member);
    }

    // 전체 게시글 목록 조회 (관리자용)
    @Transactional(readOnly = true)
    public List<PostResponse> findAllPosts() {
        return postRepository.findAllWithWriterForAdmin()
                .stream()
                .map(PostResponse::from)
                .toList();
    }

    // 게시글 강제 삭제 (관리자용)
    public void deletePost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다. id=" + postId));
        postLikeRepository.deleteByPostId(postId);
        commentRepository.deleteByPostId(postId);
        postRepository.delete(post);
    }

    // 전체 댓글 목록 조회 (관리자용)
    @Transactional(readOnly = true)
    public List<CommentResponse> findAllComments() {
        return commentRepository.findAllWithWriterAndPost()
                .stream()
                .map(CommentResponse::from)
                .toList();
    }

    // 댓글 강제 삭제 (관리자용) - post.commentCount도 함께 감소
    public void deleteComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다. id=" + commentId));

        Post post = comment.getPost();
        commentRepository.delete(comment);
        post.decreaseCommentCount();
    }

    // 통계 대시보드
    @Transactional(readOnly = true)
    public Map<String, Long> getStats() {
        long totalMembers = memberRepository.count();
        long totalPosts = postRepository.count();
        long totalComments = commentRepository.count();
        long totalAdmins = memberRepository.findAll()
                .stream()
                .filter(m -> m.getRole() == Role.ADMIN)
                .count();

        Map<String, Long> stats = new HashMap<>();
        stats.put("totalMembers", totalMembers);
        stats.put("totalPosts", totalPosts);
        stats.put("totalComments", totalComments);
        stats.put("totalAdmins", totalAdmins);

        return stats;
    }
}
