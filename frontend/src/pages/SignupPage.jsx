import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { getCurrentAddress } from "../api/kakao";

function SignupPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);

  // 현재 위치 → 카카오 API → 주소 자동 입력
  const handleGetLocation = async () => {
    setLocationLoading(true);
    try {
      const addr = await getCurrentAddress();
      setAddress(addr);
      toast.success("주소를 가져왔습니다.");
    } catch (err) {
      toast.error(err.message || "위치를 가져오지 못했습니다.");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email.trim()) { toast.error("이메일을 입력하세요."); return; }
    if (!nickname.trim()) { toast.error("닉네임을 입력하세요."); return; }
    if (nickname.trim().length < 2) { toast.error("닉네임은 2자 이상 입력하세요."); return; }
    if (!password.trim()) { toast.error("비밀번호를 입력하세요."); return; }
    if (!confirmPassword.trim()) { toast.error("비밀번호 확인을 입력하세요."); return; }
    if (password !== confirmPassword) { toast.error("비밀번호가 일치하지 않습니다."); return; }

    try {
      await api.post("/api/auth/signup", {
        email,
        nickname,
        password,
        confirmPassword,
        address: address.trim() || null, // 빈 문자열이면 null로 전송
      });
      toast.success("회원가입 성공!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error?.message || "회원가입에 실패했습니다.";
      toast.error(msg);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">회원가입</h2>

      <div className="form-group">
        <label>이메일</label>
        <input className="input" type="email" placeholder="example@email.com"
          value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="form-group">
        <label>닉네임</label>
        <input className="input" type="text" placeholder="닉네임 (2~20자)"
          value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={20} />
      </div>

      <div className="form-group">
        <label>비밀번호</label>
        <input className="input" type="password" placeholder="6자 이상"
          value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      <div className="form-group">
        <label>비밀번호 확인</label>
        <input className="input" type="password" placeholder="비밀번호 재입력"
          value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      </div>

      {/* 주소 입력 (선택) */}
      <div className="form-group">
        <label>
          주소{" "}
          <span style={{ color: "var(--hint)", fontWeight: 400 }}>(선택)</span>
        </label>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            className="input"
            type="text"
            placeholder="주소를 입력하거나 현재 위치로 가져오세요"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="btn btn-location"
            onClick={handleGetLocation}
            disabled={locationLoading}
            title="현재 위치로 주소 가져오기"
          >
            {locationLoading ? "⏳" : "📍"}
          </button>
        </div>
        <p style={{ fontSize: "11px", color: "var(--hint)", marginTop: "5px" }}>
          📍 버튼을 누르면 현재 위치 기반 주소가 자동 입력됩니다.
        </p>
      </div>

      <div className="button-row" style={{ marginTop: "20px" }}>
        <button className="btn btn-primary btn-block" onClick={handleSignup}>
          회원가입
        </button>
      </div>

      <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "var(--hint)" }}>
        이미 계정이 있으신가요?{" "}
        <Link to="/login" style={{ color: "var(--p3)", fontWeight: 600 }}>로그인</Link>
      </p>
    </div>
  );
}

export default SignupPage;
