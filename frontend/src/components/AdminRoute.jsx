import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("userRole");

  if (!token) {
    alert("로그인이 필요합니다.");
    return <Navigate to="/login" replace />;
  }

  if (role !== "ADMIN") {
    alert("관리자만 접근할 수 있습니다.");
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
