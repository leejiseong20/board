import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import toast from "react-hot-toast";
import api from "../api/axios";

function PostSkeleton() {
  return (
    <div className="page-card">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-meta" />
      <div className="skeleton skeleton-content" />
      <div className="skeleton skeleton-content" style={{ width: "80%" }} />
      <div className="skeleton skeleton-content" style={{ width: "60%" }} />
    </div>
  );
}

function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [postContent, setPostContent] = useState(null);
  const [postMeta, setPostMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [liked, setLiked] = useState(false);
  const [likeHint, setLikeHint] = useState(false);

  const isLoggedIn = !!localStorage.getItem("accessToken");
  const isAdmin = localStorage.getItem("userRole") === "ADMIN";
  const loginMemberId = Number(localStorage.getItem("memberId"));
  const isOwner = !!(postMeta && loginMemberId && postMeta.writerId === loginMemberId);

  // postContent가 바뀔 때만 sanitize 실행 (댓글 타이핑 시 절대 재실행 안 됨)
  const sanitizedContent = useMemo(
    () => DOMPurify.sanitize(postContent || ""),
    [postContent]
  );

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const requests = [
          api.get(`/api/posts/${id}`),
          api.get(`/api/posts/${id}/comments`),
        ];
        if (isLoggedIn) requests.push(api.get(`/api/posts/${id}/like-status`));

        const results = await Promise.all(requests);
        if (cancelled) return;

        const postData = results[0].data.data;

        setPostContent(postData.content);
        setPostMeta({
          id: postData.id,
          title: postData.title,
          writerId: postData.writerId,
          writerNickname: postData.writerNickname,
          viewCount: postData.viewCount,
          likeCount: postData.likeCount,
          commentCount: postData.commentCount,
          createdAt: postData.createdAt,
        });
        setComments(results[1].data.data);
        setLiked(results[2]?.data?.data?.liked ?? false);
        setLoading(false);

        // 조회수 증가 요청만 — 재조회 없이 클라이언트에서 +1 처리
        // (서버 재조회를 하면 setPostMeta → 리렌더링 → 이미지 재로드 발생)
        const alreadyViewed = sessionStorage.getItem(`viewed_${id}`);
        if (!alreadyViewed) {
          await api.post(`/api/posts/${id}/view`);
          if (!cancelled) {
            setPostMeta((prev) => prev
              ? { ...prev, viewCount: prev.viewCount + 1 }
              : prev
            );
            sessionStorage.setItem(`viewed_${id}`, "1");
          }
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, [id, isLoggedIn]);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/api/posts/${id}/comments`);
      setComments(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleLikeToggle = async () => {
    if (!isLoggedIn) {
      setLikeHint(true);
      setTimeout(() => setLikeHint(false), 3000);
      return;
    }
    try {
      if (liked) {
        await api.delete(`/api/posts/${id}/like`);
        setLiked(false);
        setPostMeta((prev) => prev ? { ...prev, likeCount: Math.max((prev.likeCount ?? 1) - 1, 0) } : prev);
      } else {
        await api.post(`/api/posts/${id}/like`);
        setLiked(true);
        setPostMeta((prev) => prev ? { ...prev, likeCount: (prev.likeCount ?? 0) + 1 } : prev);
      }
    } catch (err) { console.error(err); }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      if (isAdmin && !isOwner) {
        await api.delete(`/api/admin/posts/${id}`);
      } else {
        await api.delete(`/api/posts/${id}`);
      }
      toast.success("게시글이 삭제되었습니다.");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("게시글 삭제에 실패했습니다.");
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentContent.trim()) return;
    try {
      await api.post(`/api/posts/${id}/comments`, { content: commentContent });
      setCommentContent("");
      await fetchComments();
      setPostMeta((prev) => prev ? { ...prev, commentCount: (prev.commentCount ?? 0) + 1 } : prev);
      toast.success("댓글이 등록되었습니다.");
    } catch (err) {
      console.error(err);
      toast.error("댓글 작성에 실패했습니다.");
    }
  };

  const startCommentEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
  };

  const cancelCommentEdit = () => {
    setEditingCommentId(null);
    setEditingCommentContent("");
  };

  const saveCommentEdit = async (commentId) => {
    if (!editingCommentContent.trim()) return;
    try {
      await api.put(`/api/posts/${id}/comments/${commentId}`, { content: editingCommentContent });
      setEditingCommentId(null);
      setEditingCommentContent("");
      await fetchComments();
      toast.success("댓글이 수정되었습니다.");
    } catch (err) {
      console.error(err);
      toast.error("댓글 수정에 실패했습니다.");
    }
  };

  const handleCommentDelete = async (commentId, commentWriterId) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      if (isAdmin && loginMemberId !== commentWriterId) {
        await api.delete(`/api/admin/comments/${commentId}`);
      } else {
        await api.delete(`/api/posts/${id}/comments/${commentId}`);
      }
      await fetchComments();
      setPostMeta((prev) => prev ? { ...prev, commentCount: Math.max((prev.commentCount ?? 1) - 1, 0) } : prev);
      toast.success("댓글이 삭제되었습니다.");
    } catch (err) {
      console.error(err);
      toast.error("댓글 삭제에 실패했습니다.");
    }
  };

  if (loading) return <PostSkeleton />;

  return (
    <div className="page-card">
      <div className="detail-header">
        <h2 className="detail-title">{postMeta.title}</h2>
        <div className="detail-meta">
          <span>✦ {postMeta.writerNickname ?? "알 수 없음"}</span>
          <span>{postMeta.createdAt ? new Date(postMeta.createdAt).toLocaleDateString("ko-KR") : ""}</span>
          <span>👁 {postMeta.viewCount}</span>
          <span>♥ {postMeta.likeCount ?? 0}</span>
          <span>💬 {postMeta.commentCount ?? 0}</span>
        </div>
      </div>

      <div
        className="post-content"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />

      <div className="button-row">
        <button className={`btn ${liked ? "btn-liked" : "btn-primary"}`} onClick={handleLikeToggle}>
          {liked ? "♥ 좋아요 취소" : "♡ 좋아요"}
        </button>
        {isOwner && (
          <button className="btn" onClick={() => navigate(`/posts/${id}/edit`)}>수정</button>
        )}
        {(isOwner || isAdmin) && (
          <button className="btn btn-danger" onClick={handleDeletePost}>
            {isAdmin && !isOwner ? "관리자 삭제" : "삭제"}
          </button>
        )}
      </div>

      {likeHint && (
        <div className="like-hint">
          <span>좋아요를 누르려면</span>
          <Link to="/login" className="like-hint-link">로그인</Link>
          <span>이 필요합니다.</span>
        </div>
      )}

      <hr className="divider" />
      <h3 className="sub-title">댓글</h3>

      {isLoggedIn ? (
        <div className="comment-box">
          <textarea
            className="textarea"
            placeholder="댓글을 입력하세요"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            rows={4}
          />
          <div className="button-row">
            <button className="btn btn-primary" onClick={handleCommentSubmit}>댓글 등록</button>
          </div>
        </div>
      ) : (
        <div className="login-required-notice">
          댓글을 작성하려면{" "}
          <Link to="/login" className="like-hint-link">로그인</Link>이 필요합니다.
        </div>
      )}

      <div className="comment-list">
        {comments.length === 0 ? (
          <p className="empty-text">아직 댓글이 없습니다.</p>
        ) : (
          comments.map((comment) => {
            const isCommentOwner = !!(loginMemberId && comment.writerId === loginMemberId);
            const isEditing = editingCommentId === comment.id;

            return (
              <div key={comment.id} className="comment-item">
                {isEditing ? (
                  <div>
                    <textarea
                      className="textarea"
                      value={editingCommentContent}
                      onChange={(e) => setEditingCommentContent(e.target.value)}
                      rows={3}
                    />
                    <div className="button-row">
                      <button className="btn btn-primary" onClick={() => saveCommentEdit(comment.id)}>저장</button>
                      <button className="btn" onClick={cancelCommentEdit}>취소</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="comment-content">{comment.content}</div>
                    <div className="comment-meta">
                      ✦ {comment.writerNickname ?? "알 수 없음"} ·{" "}
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString("ko-KR") : ""}
                    </div>
                    {(isCommentOwner || isAdmin) && (
                      <div className="button-row">
                        {isCommentOwner && (
                          <button className="btn" onClick={() => startCommentEdit(comment)}>수정</button>
                        )}
                        <button
                          className="btn btn-danger"
                          onClick={() => handleCommentDelete(comment.id, comment.writerId)}
                        >
                          {isAdmin && !isCommentOwner ? "관리자 삭제" : "삭제"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default PostDetailPage;
