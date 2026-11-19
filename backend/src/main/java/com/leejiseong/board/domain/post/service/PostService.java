package com.leejiseong.board.domain.post.service;

import com.leejiseong.board.domain.comment.repository.CommentRepository;
import com.leejiseong.board.domain.member.Member;
import com.leejiseong.board.domain.member.repository.MemberRepository;
import com.leejiseong.board.domain.post.Post;
import com.leejiseong.board.domain.post.dto.PostCreateRequest;
import com.leejiseong.board.domain.post.dto.PostLikeStatusResponse;
import com.leejiseong.board.domain.post.dto.PostResponse;
import com.leejiseong.board.domain.post.dto.PostUpdateRequest;
import com.leejiseong.board.domain.post.repository.PostRepository;
import com.leejiseong.board.domain.postlike.PostLike;
import com.leejiseong.board.domain.postlike.repository.PostLikeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional
public class PostService {

    private final PostRepository postRepository;
    private final MemberRepository memberRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;

    public PostService(PostRepository postRepository,
                       MemberRepository memberRepository,
                       PostLikeRepository postLikeRepository,
                       CommentRepository commentRepository) {
        this.postRepository = postRepository;
        this.memberRepository = memberRepository;
        this.postLikeRepository = postLikeRepository;
        this.commentRepository = commentRepository;
    }

    public Long create(PostCreateRequest req, String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        Post post = new Post(req.getTitle(), req.getContent(), member);
        return postRepository.save(post).getId();
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> findPage(String keyword, Pageable pageable) {
        if (StringUtils.hasText(keyword)) {
            return postRepository.findByTitleWithWriter(keyword, pageable)
                    .map(PostResponse::from);
        }
        return postRepository.findAllWithWriter(pageable)
                .map(PostResponse::from);
    }

    @Transactional(readOnly = true)
    public PostResponse findOne(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다. id=" + id));
        return PostResponse.from(post);
    }

    // 내가 쓴 글 조회
    @Transactional(readOnly = true)
    public Page<PostResponse> findMyPosts(String email, int page, int size) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return postRepository.findByWriterIdWithWriter(member.getId(), pageable)
                .map(PostResponse::from);
    }

    public void increaseView(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다. id=" + id));
        post.increaseViewCount();
    }

    public PostResponse update(Long id, PostUpdateRequest req, String email) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다. id=" + id));

        if (post.getWriter() == null || !post.getWriter().getEmail().equals(email)) {
            throw new SecurityException("본인이 작성한 글만 수정할 수 있습니다.");
        }

        post.update(req.getTitle(), req.getContent());
        return PostResponse.from(post);
    }

    public void delete(Long id, String email) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다. id=" + id));

        if (post.getWriter() == null || !post.getWriter().getEmail().equals(email)) {
            throw new SecurityException("본인이 작성한 글만 삭제할 수 있습니다.");
        }

        postLikeRepository.deleteByPostId(id);
        commentRepository.deleteByPostId(id);
        postRepository.delete(post);
    }

    public void like(Long postId, String email) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다. id=" + postId));

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        if (postLikeRepository.existsByPostIdAndMemberId(postId, member.getId())) return;

        postLikeRepository.save(new PostLike(post, member));
        post.increaseLikeCount();
    }

    public void unlike(Long postId, String email) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다. id=" + postId));

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        postLikeRepository.findByPostIdAndMemberId(postId, member.getId())
                .ifPresent(postLike -> {
                    postLikeRepository.delete(postLike);
                    post.decreaseLikeCount();
                });
    }

    @Transactional(readOnly = true)
    public PostLikeStatusResponse getLikeStatus(Long postId, String email) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다. id=" + postId));

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));

        boolean liked = postLikeRepository.existsByPostIdAndMemberId(postId, member.getId());
        return new PostLikeStatusResponse(liked, post.getLikeCount());
    }
}
