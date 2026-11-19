import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post("/api/auth/login", { email, password });

      const data = res.data.data ?? res.data;
      const token    = data.accessToken;
      const role     = data.role;
      const nickname = data.nickname;
      const memberId = data.memberId;

      if (!token) {
        toast.error("토큰이 응답에 없습니다.");
        return;
      }

      localStorage.setItem("accessToken", token);
      localStorage.setItem("loginEmail",  email);
      localStorage.setItem("userRole",    role     ?? "USER");
      localStorage.setItem("nickname",    nickname ?? email);
      localStorage.setItem("memberId",    String(memberId));

      toast.success("로그인 성공!");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="form-container">
      <h2 className="form-title">로그인</h2>

      <div className="form-group">
        <label>이메일</label>
        <input
          className="input"
          type="email"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="form-group">
        <label>비밀번호</label>
        <input
          className="input"
          type="password"
          placeholder="비밀번호 입력"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="button-row" style={{ marginTop: "20px" }}>
        <button className="btn btn-primary btn-block" onClick={handleLogin}>
          로그인
        </button>
      </div>

      <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "var(--hint)" }}>
        계정이 없으신가요?{" "}
        <Link to="/signup" style={{ color: "var(--p3)", fontWeight: 600 }}>회원가입</Link>
      </p>
    </div>
  );
}

export default LoginPage;
