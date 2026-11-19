import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });
}

function stripHtml(html) {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

function truncate(text, maxLength = 100) {
  if (!text) return "";
  const t = text.trim();
  return t.length > maxLength ? t.slice(0, maxLength) + "..." : t;
}

function getPageRange(current, total) {
  const range = 2;
  const start = Math.max(0, current - range);
  const end = Math.min(total - 1, current + range);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// 2번: 게시글 목록 스켈레톤
function PostListSkeleton() {
  return (
    <div className="post-list">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="post-item">
          <div className="skeleton skeleton-post-title" />
          <div className="skeleton skeleton-post-preview" />
          <div className="skeleton skeleton-post-meta" />
        </div>
      ))}
    </div>
  );
}

function PostListPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState("latest");
  const [pageInfo, setPageInfo] = useState({
    number: 0, totalPages: 0, first: true, last: true,
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const loadPosts = async () => {
      try {
        const params = { page, size: 10, sortBy };
        if (keyword.trim()) params.keyword = keyword.trim();

        const res = await api.get("/api/posts", { params });
        if (!cancelled) {
          setPosts(res.data.data.content);
          setPageInfo(res.data.data.page);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    loadPosts();
    return () => { cancelled = true; };
  }, [page, keyword, sortBy]);

  const handleSearch = () => { setPage(0); setKeyword(keywordInput); };
  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearch(); };
  const handleSortChange = (e) => { setPage(0); setSortBy(e.target.value); };

  const pageNumbers = getPageRange(pageInfo.number, pageInfo.totalPages);

  return (
    <div className="page-card">
      <h2 className="section-title">게시글 목록</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input
          className="input"
          type="text"
          placeholder="제목 검색"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1, minWidth: "220px" }}
        />
        <select
          className="input"
          value={sortBy}
          onChange={handleSortChange}
          style={{ width: "130px", flex: "0 0 130px" }}
        >
          <option value="latest">최신순</option>
          <option value="views">조회순</option>
          <option value="likes">좋아요순</option>
        </select>
        <button className="btn btn-primary" onClick={handleSearch}>검색</button>
      </div>

      {/* 2번: 로딩 중이면 스켈레톤, 아니면 실제 목록 */}
      {loading ? (
        <PostListSkeleton />
      ) : posts.length === 0 ? (
        <p className="empty-text">게시글이 없습니다.</p>
      ) : (
        <div className="post-list">
          {posts.map((post) => (
            <div key={post.id} className="post-item">
              <h3 className="post-title">
                <Link to={`/posts/${post.id}`}>{post.title}</Link>
              </h3>
              <div className="post-preview">{truncate(stripHtml(post.content))}</div>
              <div className="post-meta">
                <span>✦ {post.writerNickname ?? "알 수 없음"}</span>
                <span>{formatDate(post.createdAt)}</span>
                <span>👁 {post.viewCount}</span>
                <span>♥ {post.likeCount ?? 0}</span>
                <span>💬 {post.commentCount ?? 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {pageInfo.totalPages > 1 && (
        <div className="pagination">
          <button className="btn" onClick={() => setPage(0)} disabled={pageInfo.first}>«</button>
          <button className="btn" onClick={() => setPage((p) => p - 1)} disabled={pageInfo.first}>‹</button>
          {pageNumbers.map((num) => (
            <button
              key={num}
              className={`btn ${pageInfo.number === num ? "btn-page-active" : ""}`}
              onClick={() => setPage(num)}
            >
              {num + 1}
            </button>
          ))}
          <button className="btn" onClick={() => setPage((p) => p + 1)} disabled={pageInfo.last}>›</button>
          <button className="btn" onClick={() => setPage(pageInfo.totalPages - 1)} disabled={pageInfo.last}>»</button>
        </div>
      )}
    </div>
  );
}

export default PostListPage;
