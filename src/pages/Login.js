import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      const messages = {
        "auth/user-not-found": "Bu e-posta ile kayıtlı kullanıcı bulunamadı.",
        "auth/wrong-password": "Şifre yanlış, tekrar deneyin.",
        "auth/invalid-email": "Geçersiz e-posta adresi.",
        "auth/too-many-requests": "Çok fazla deneme. Lütfen bekleyin.",
        "auth/invalid-credential": "E-posta veya şifre hatalı.",
      };
      setError(messages[err.code] || "Giriş yapılamadı. Lütfen tekrar deneyin.");
    }
    setLoading(false);
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">⬡</div>
          <h1>Tekrar hoşgeldin</h1>
          <p>Hesabına giriş yap</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>E-posta</label>
            <input
              type="email"
              placeholder="ornek@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Şifre</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : "Giriş Yap"}
          </button>
        </form>

        <p className="auth-switch">
          Hesabın yok mu? <Link to="/register">Kayıt ol</Link>
        </p>
      </div>
    </div>
  );
}
