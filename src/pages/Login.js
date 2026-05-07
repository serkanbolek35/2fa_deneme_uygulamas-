import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import * as OTPAuth from "otpauth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const [secret, setSecret] = useState("");
  const { login, setAwaitingTwoFA } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    setLoading(true);
    // Önce true set et ki onAuthStateChanged tetiklenince dashboard'a gitmesin
    setAwaitingTwoFA(true);
    try {
      const result = await login(email, password);
      const ref = doc(db, "users", result.user.uid);
      const snap = await getDoc(ref);

      if (snap.exists() && snap.data().twoFAEnabled) {
        setSecret(snap.data().twoFASecret);
        setShow2FA(true);
        setLoading(false);
      } else {
        // 2FA yok, direkt geç
        setAwaitingTwoFA(false);
        navigate("/dashboard");
      }
    } catch (err) {
      setAwaitingTwoFA(false);
      const messages = {
        "auth/user-not-found": "Bu e-posta ile kayıtlı kullanıcı bulunamadı.",
        "auth/wrong-password": "Şifre yanlış, tekrar deneyin.",
        "auth/invalid-email": "Geçersiz e-posta adresi.",
        "auth/too-many-requests": "Çok fazla deneme. Lütfen bekleyin.",
        "auth/invalid-credential": "E-posta veya şifre hatalı.",
      };
      setError(messages[err.code] || "Giriş yapılamadı.");
      setLoading(false);
    }
  }

  function verify2FA() {
    const totp = new OTPAuth.TOTP({ secret: secret, digits: 6 });
    const delta = totp.validate({ token: twoFACode, window: 1 });
    if (delta !== null) {
      setAwaitingTwoFA(false);
      navigate("/dashboard");
    } else {
      setError("Kod yanlış, tekrar dene.");
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") verify2FA();
  }

  if (show2FA) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">🔐</div>
            <h1>2FA Doğrulama</h1>
            <p>Authenticator uygulamanındaki 6 haneli kodu gir</p>
          </div>
          {error && <div className="auth-error">{error}</div>}
          <div className="auth-form">
            <div className="form-group">
              <label>Doğrulama Kodu</label>
              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                style={{letterSpacing:"0.2em", fontFamily:"monospace", fontSize:"1.2rem", textAlign:"center"}}
              />
            </div>
            <button className="auth-btn" onClick={verify2FA}>
              Doğrula ve Giriş Yap
            </button>
          </div>
        </div>
      </div>
    );
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
            <input type="email" placeholder="ornek@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Şifre</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
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
