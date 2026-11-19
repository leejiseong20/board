import { useState, useEffect } from "react";
import {
  fetchStats,
  fetchMembers,
  fetchPosts,
  fetchComments,
  updateMemberRole,
  deletePostByAdmin,
  deleteCommentByAdmin,
} from "../api/admin";

function AdminPage() {
  const [tab, setTab] = useState("stats"); // "stats" | "members"
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  // 통계 불러오기
  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetchStats();
      setStats(res.data.data ?? res.data);
    } catch {
      alert("통계 불러오기 실패");
    } finally {
      setLoading(false);
    }
  };

  // 회원 목록 불러오기
  const loadMembers = async () => {
    setLoading(true);
    try {
      const res = await fetchMembers();
      setMembers(res.data.data ?? res.data);
    } catch {
      alert("회원 목록 불러오기 실패");
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await fetchPosts();
      setPosts(res.data.data ?? res.data);
    } catch {
      alert("게시글 목록 불러오기 실패");
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await fetchComments();
      const commentList = res.data.data ?? res.data ?? [];
      setComments(Array.isArray(commentList) ? commentList : []);
    } catch (err) {
      console.error("[댓글 로드 오류]", err);
      alert("댓글 목록 불러오기 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "stats") loadStats();
    else if (tab === "members") loadMembers();
    else if (tab === "posts") loadPosts();
    else if (tab === "comments") loadComments();
  }, [tab]);

  // 권한 변경
  const handleRoleChange = async (memberId, currentRole) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    if (!window.confirm(`권한을 ${newRole}로 변경할까요?`)) return;
    try {
      await updateMemberRole(memberId, newRole);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
    } catch {
      alert("권한 변경 실패");
    }
  };

  // 게시글 삭제
  const handleDeletePost = async (postId, title) => {
    if (!window.confirm(`"${title}" 게시글을 삭제할까요?`)) return;
    try {
      await deletePostByAdmin(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      alert("게시글이 삭제되었습니다.");
    } catch {
      alert("게시글 삭제 실패");
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId, content) => {
    if (!window.confirm(`"${content}" 댓글을 삭제할까요?`)) return;
    try {
      await deleteCommentByAdmin(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      alert("댓글이 삭제되었습니다.");
    } catch {
      alert("댓글 삭제 실패");
    }
  };

  return (
    <div className="page-card">
      <h2 className="section-title">🛠️ 관리자 페이지</h2>

      {/* 탭 메뉴 */}
      <div className="button-row" style={{ marginBottom: "1.5rem" }}>
        <button
          className={`btn ${tab === "stats" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setTab("stats")}
        >
          📊 통계
        </button>
        <button
          className={`btn ${tab === "members" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setTab("members")}
        >
          👥 회원 관리
        </button>
        <button
          className={`btn ${tab === "posts" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setTab("posts")}
        >
          📝 게시글 관리
        </button>
        <button
          className={`btn ${tab === "comments" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setTab("comments")}
        >
          💬 댓글 관리
        </button>
      </div>

      {loading && <p>불러오는 중...</p>}

      {/* 통계 탭 */}
      {!loading && tab === "stats" && stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
          <StatCard label="전체 회원" value={stats.totalMembers} emoji="👥" />
          <StatCard label="관리자 수" value={stats.totalAdmins} emoji="🛡️" />
          <StatCard label="전체 게시글" value={stats.totalPosts} emoji="📝" />
          <StatCard label="전체 댓글" value={stats.totalComments} emoji="💬" />
        </div>
      )}

      {/* 게시글 관리 탭 */}
      {!loading && tab === "posts" && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
              <th style={{ padding: "8px" }}>ID</th>
              <th style={{ padding: "8px" }}>제목</th>
              <th style={{ padding: "8px" }}>작성자</th>
              <th style={{ padding: "8px" }}>작성일</th>
              <th style={{ padding: "8px" }}>삭제</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px" }}>{post.id}</td>
                <td style={{ padding: "8px" }}>{post.title}</td>
                <td style={{ padding: "8px" }}>{post.writerNickname ?? "알 수 없음"}</td>
                <td style={{ padding: "8px" }}>
                  {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                </td>
                <td style={{ padding: "8px" }}>
                  <button
                    className="btn btn-danger"
                    style={{ padding: "4px 12px", fontSize: "0.8rem" }}
                    onClick={() => handleDeletePost(post.id, post.title)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 댓글 관리 탭 */}
      {!loading && tab === "comments" && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
              <th style={{ padding: "8px" }}>ID</th>
              <th style={{ padding: "8px" }}>내용</th>
              <th style={{ padding: "8px" }}>작성자</th>
              <th style={{ padding: "8px" }}>작성일</th>
              <th style={{ padding: "8px" }}>삭제</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment) => (
              <tr key={comment.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px" }}>{comment.id}</td>
                <td style={{ padding: "8px" }}>{comment.content}</td>
                <td style={{ padding: "8px" }}>{comment.writerNickname ?? "알 수 없음"}</td>
                <td style={{ padding: "8px" }}>
                  {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
                </td>
                <td style={{ padding: "8px" }}>
                  <button
                    className="btn btn-danger"
                    style={{ padding: "4px 12px", fontSize: "0.8rem" }}
                    onClick={() => handleDeleteComment(comment.id, comment.content)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 회원 관리 탭 */}
      {!loading && tab === "members" && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
              <th style={{ padding: "8px" }}>ID</th>
              <th style={{ padding: "8px" }}>닉네임</th>
              <th style={{ padding: "8px" }}>이메일</th>
              <th style={{ padding: "8px" }}>권한</th>
              <th style={{ padding: "8px" }}>가입일</th>
              <th style={{ padding: "8px" }}>권한 변경</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px" }}>{member.id}</td>
                <td style={{ padding: "8px" }}>{member.nickname ?? "-"}</td>
                <td style={{ padding: "8px" }}>{member.email}</td>
                <td style={{ padding: "8px" }}>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                      background: member.role === "ADMIN" ? "#ff4d4f22" : "#1890ff22",
                      color: member.role === "ADMIN" ? "#cf1322" : "#096dd9",
                      fontWeight: "bold",
                    }}
                  >
                    {member.role}
                  </span>
                </td>
                <td style={{ padding: "8px" }}>
                  {new Date(member.createdAt).toLocaleDateString("ko-KR")}
                </td>
                <td style={{ padding: "8px" }}>
                  <button
                    className={`btn ${member.role === "ADMIN" ? "btn-danger" : "btn-primary"}`}
                    style={{ padding: "4px 12px", fontSize: "0.8rem" }}
                    onClick={() => handleRoleChange(member.id, member.role)}
                  >
                    {member.role === "ADMIN" ? "USER로 변경" : "ADMIN으로 변경"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StatCard({ label, value, emoji }) {
  return (
    <div
      style={{
        padding: "1.5rem",
        borderRadius: "12px",
        background: "#f5f5f5",
        textAlign: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ fontSize: "2rem" }}>{emoji}</div>
      <div style={{ fontSize: "2rem", fontWeight: "bold", margin: "0.5rem 0" }}>{value}</div>
      <div style={{ color: "#666", fontSize: "0.9rem" }}>{label}</div>
    </div>
  );
}

export default AdminPage;
