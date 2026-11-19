import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import PostListPage from "./pages/PostListPage";
import PostDetailPage from "./pages/PostDetailPage";
import PostWritePage from "./pages/PostWritePage";
import PostEditPage from "./pages/PostEditPage";
import AdminPage from "./pages/AdminPage";
import MyPage from "./pages/MyPage";
import FriendPage from "./pages/FriendPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { getMe } from "./api/member";

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("accessToken");
  const loginEmail = localStorage.getItem("loginEmail");
  const userRole = localStorage.getItem("userRole");
  const isLoggedIn = !!token;
  const isAdmin = userRole === "ADMIN";

  const [nickname, setNickname] = useState(localStorage.getItem("nickname") || "");

  useEffect(() => {
    if (!isLoggedIn) return;
    if (localStorage.getItem("memberId")) return;
    getMe()
      .then((res) => {
        const data = res.data.data;
        localStorage.setItem("memberId", String(data.id));
        if (!localStorage.getItem("nickname") && data.nickname) {
          localStorage.setItem("nickname", data.nickname);
          setNickname(data.nickname);
        }
      })
      .catch(() => {});
  }, [isLoggedIn]);

  useEffect(() => {
    const handleNicknameUpdated = () => {
      setNickname(localStorage.getItem("nickname") || "");
    };
    window.addEventListener("nicknameUpdated", handleNicknameUpdated);
    return () => window.removeEventListener("nicknameUpdated", handleNicknameUpdated);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("loginEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("nickname");
    localStorage.removeItem("memberId");
    toast.success("로그아웃 되었습니다.");
    navigate("/");
  };

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <Link to="/" className="top-nav-brand">Board</Link>
        <div className="top-nav-spacer" />
        {!isLoggedIn && (
          <>
            <Link to="/login">로그인</Link>
            <Link to="/signup">회원가입</Link>
          </>
        )}
        {isLoggedIn && (
          <>
            <Link to="/mypage" className="top-nav-user">{nickname || loginEmail} 님</Link>
            <Link to="/write">글쓰기</Link>
            <Link to="/friends">친구</Link>
            {isAdmin && <Link to="/admin">관리자</Link>}
            <button onClick={handleLogout}>로그아웃</button>
          </>
        )}
      </nav>

      <div className="app-container">
        <Routes>
          <Route path="/" element={<PostListPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/write" element={<ProtectedRoute><PostWritePage /></ProtectedRoute>} />
          <Route path="/posts/:id/edit" element={<ProtectedRoute><PostEditPage /></ProtectedRoute>} />
          <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><FriendPage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
