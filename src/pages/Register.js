import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      return setError("Şifreler eşleşmiyor.");
    }
    if (password.length < 6) {
      return setError("Şifre en az 6 karakter olmalı.");
    }

    setLoading(true);
    try {
      await register(email, password, name);
      navigate("/dashboard");
    } catch (err) {
      const messages = {
        "auth/email-already-in-use": "Bu e-posta zaten kullanımda.",
        "auth/invalid-email": "Geçersiz e-posta adresi.",
        "auth/weak-password": "Şifre çok zayıf.",
      };
      setError(messages[err.code] || "Kayıt olunamadı. Lütfen tekrar deneyin.");
    }
    setLoading(false);
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">⬡</div>
          <h1>Hesap Oluştur</h1>
          <p>Birkaç adımda kayıt ol</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Ad Soyad</label>
            <input
              type="text"
              placeholder="Adın Soyadın"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
              placeholder="En az 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Şifre Tekrar</label>
            <input
              type="password"
              placeholder="Şifreni tekrar gir"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : "Kayıt Ol"}
          </button>
        </form>

        <p className="auth-switch">
          Zaten hesabın var mı? <Link to="/login">Giriş yap</Link>
        </p>
      </div>
    </div>
  );
}
