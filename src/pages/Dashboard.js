import React from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const initials = currentUser?.displayName
    ? currentUser.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : currentUser?.email?.[0].toUpperCase();

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-logo">⬡ MyApp</div>
        <button className="logout-btn" onClick={handleLogout}>
          Çıkış Yap
        </button>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-card">
          <div className="avatar">{initials}</div>
          <div className="welcome-text">
            <h1>Hoşgeldin, {currentUser?.displayName || "Kullanıcı"}! 👋</h1>
            <p>{currentUser?.email}</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">🔐</span>
            <div>
              <p className="stat-label">Durum</p>
              <p className="stat-value">Doğrulandı</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📅</span>
            <div>
              <p className="stat-label">Kayıt Tarihi</p>
              <p className="stat-value">
                {new Date(currentUser?.metadata?.creationTime).toLocaleDateString("tr-TR")}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⚡</span>
            <div>
              <p className="stat-label">Son Giriş</p>
              <p className="stat-value">
                {new Date(currentUser?.metadata?.lastSignInTime).toLocaleDateString("tr-TR")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
