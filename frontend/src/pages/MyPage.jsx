import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { updateNickname, updatePassword, getMyPosts } from "../api/member";

function stripHtml(html) {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

function truncate(text, max = 60) {
  const t = text.trim();
  return t.length > max ? t.slice(0, max) + "..." : t;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("ko-KR");
}

export default function MyPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("info");
  const [currentNickname, setCurrentNickname] = useState(localStorage.getItem("nickname") || "");

  const [nickname, setNickname] = useState("");
  const [nicknameLoading, setNicknameLoading] = useState(false);

  const [pwForm, setPwForm] = useState({
    currentPassword: "", newPassword: "", confirmNewPassword: "",
  });
  const [pwLoading, setPwLoading] = useState(false);

  const [myPosts, setMyPosts] = useState([]);
  const [myPostsPage, setMyPostsPage] = useState(0);
  const [myPostsPageInfo, setMyPostsPageInfo] = useState({
    totalPages: 0, first: true, last: true, number: 0,
  });
  const [myPostsLoading, setMyPostsLoading] = useState(false);

  useEffect(() => {
    if (tab !== "posts") return;
    setMyPostsLoading(true);
    getMyPosts(myPostsPage, 10)
      .then((res) => {
        const data = res.data.data;
        setMyPosts(data.content);
        setMyPostsPageInfo(data.page);
      })
      .catch(console.error)
      .finally(() => setMyPostsLoading(false));
  }, [tab, myPostsPage]);

  const handleNicknameSubmit = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    setNicknameLoading(true);
    try {
      const res = await updateNickname(nickname.trim());
      const newNickname = res.data.data;
      localStorage.setItem("nickname", newNickname);
      window.dispatchEvent(new Event("nicknameUpdated"));
      setCurrentNickname(newNickname);
      setNickname("");
      toast.success("닉네임이 변경되었습니다.");
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "닉네임 변경에 실패했습니다.");
    } finally {
      setNicknameLoading(false);
    }
  };

  const handlePwChange = (e) => setPwForm({ ...pwForm, [e.target.name]: e.target.value });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmNewPassword) {
      toast.error("새 비밀번호가 일치하지 않습니다."); return;
    }
    if (pwForm.newPassword === pwForm.currentPassword) {
      toast.error("현재 비밀번호와 동일한 비밀번호로 변경할 수 없습니다."); return;
    }
    setPwLoading(true);
    try {
      await updatePassword(pwForm.currentPassword, pwForm.newPassword, pwForm.confirmNewPassword);
      toast.success("비밀번호가 변경되었습니다. 2초 후 로그인 페이지로 이동합니다.");
      setPwForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      setTimeout(() => {
        ["accessToken", "loginEmail", "userRole", "nickname", "memberId"].forEach(
          (k) => localStorage.removeItem(k)
        );
        navigate("/login");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "비밀번호 변경에 실패했습니다.");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="mypage-container">
      <div className="mypage-header">
        <div className="mypage-avatar">{currentNickname.charAt(0).toUpperCase()}</div>
        <div>
          <div className="mypage-username">{currentNickname}</div>
          <div className="mypage-email">{localStorage.getItem("loginEmail")}</div>
        </div>
      </div>

      <div className="mypage-tabs">
        <button className={`mypage-tab ${tab === "info" ? "active" : ""}`} onClick={() => setTab("info")}>내 정보</button>
        <button className={`mypage-tab ${tab === "posts" ? "active" : ""}`} onClick={() => setTab("posts")}>내가 쓴 글</button>
      </div>

      {tab === "info" && (
        <div className="mypage-body">
          <section className="mypage-section">
            <h3 className="mypage-section-title">닉네임 변경</h3>
            <p className="mypage-current-info">
              현재 닉네임: <strong style={{ color: "var(--p3)" }}>{currentNickname}</strong>
            </p>
            <form onSubmit={handleNicknameSubmit} className="mypage-form">
              <div className="form-group">
                <label>새 닉네임</label>
                <input
                  className="input" type="text"
                  value={nickname} onChange={(e) => setNickname(e.target.value)}
                  placeholder="새 닉네임 (2~20자)" minLength={2} maxLength={20} required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={nicknameLoading}>
                {nicknameLoading ? "변경 중..." : "닉네임 변경"}
              </button>
            </form>
          </section>

          <hr className="mypage-divider" />

          <section className="mypage-section">
            <h3 className="mypage-section-title">비밀번호 변경</h3>
            <form onSubmit={handlePasswordSubmit} className="mypage-form">
              {["currentPassword", "newPassword", "confirmNewPassword"].map((name) => (
                <div className="form-group" key={name}>
                  <label>
                    {name === "currentPassword" ? "현재 비밀번호"
                      : name === "newPassword" ? "새 비밀번호"
                      : "새 비밀번호 확인"}
                  </label>
                  <input
                    className="input" type="password" name={name}
                    value={pwForm[name]} onChange={handlePwChange}
                    placeholder={name === "newPassword" ? "6자 이상" : ""}
                    minLength={name === "newPassword" ? 6 : undefined} required
                  />
                </div>
              ))}
              <button type="submit" className="btn btn-primary btn-block" disabled={pwLoading}>
                {pwLoading ? "변경 중..." : "비밀번호 변경"}
              </button>
            </form>
          </section>
        </div>
      )}

      {tab === "posts" && (
        <div className="mypage-body">
          {myPostsLoading ? (
            <div className="loading-text">불러오는 중...</div>
          ) : myPosts.length === 0 ? (
            <p className="empty-text" style={{ padding: "24px 0" }}>작성한 게시글이 없습니다.</p>
          ) : (
            <>
              <div className="mypost-list">
                {myPosts.map((post) => (
                  <Link to={`/posts/${post.id}`} key={post.id} className="mypost-item">
                    <div className="mypost-title">{post.title}</div>
                    <div className="mypost-preview">{truncate(stripHtml(post.content))}</div>
                    <div className="mypost-meta">
                      <span>{formatDate(post.createdAt)}</span>
                      <span>👁 {post.viewCount}</span>
                      <span>♥ {post.likeCount}</span>
                      <span>💬 {post.commentCount}</span>
                    </div>
                  </Link>
                ))}
              </div>
              {myPostsPageInfo.totalPages > 1 && (
                <div className="pagination" style={{ marginTop: "20px" }}>
                  <button className="btn" disabled={myPostsPageInfo.first} onClick={() => setMyPostsPage((p) => p - 1)}>이전</button>
                  {Array.from({ length: myPostsPageInfo.totalPages }, (_, i) => (
                    <button key={i} className={`btn ${myPostsPageInfo.number === i ? "btn-page-active" : ""}`} onClick={() => setMyPostsPage(i)}>{i + 1}</button>
                  ))}
                  <button className="btn" disabled={myPostsPageInfo.last} onClick={() => setMyPostsPage((p) => p + 1)}>다음</button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
