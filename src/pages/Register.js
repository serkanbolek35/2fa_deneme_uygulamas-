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

  const rules = [
    { label: "En az 8 karakter", test: (p) => p.length >= 8 },
    { label: "En az bir buyuk harf (A-Z)", test: (p) => /[A-Z]/.test(p) },
    { label: "En az bir kucuk harf (a-z)", test: (p) => /[a-z]/.test(p) },
    { label: "En az bir rakam (0-9)", test: (p) => /[0-9]/.test(p) },
    { label: "En az bir ozel karakter (!@#$...)", test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) return setError("Sifreler eslesmıyor.");
    if (password.length < 8) return setError("Sifre en az 8 karakter olmali.");
    if (!/[A-Z]/.test(password)) return setError("Sifre en az bir buyuk harf icermeli.");
    if (!/[a-z]/.test(password)) return setError("Sifre en az bir kucuk harf icermeli.");
    if (!/[0-9]/.test(password)) return setError("Sifre en az bir rakam icermeli.");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return setError("Sifre en az bir ozel karakter icermeli (!, @, #, $ vb.).");

    setLoading(true);
    try {
      await register(email, password, name);
      navigate("/dashboard");
    } catch (err) {
      const messages = {
        "auth/email-already-in-use": "Bu e-posta zaten kullanimda.",
        "auth/invalid-email": "Gecersiz e-posta adresi.",
        "auth/weak-password": "Sifre cok zayif.",
      };
      setError(messages[err.code] || "Kayit olunamadi. Lutfen tekrar deneyin.");
    }
    setLoading(false);
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">⬡</div>
          <h1>Hesap Olustur</h1>
          <p>Birkac adimda kayit ol</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Ad Soyad</label>
            <input type="text" placeholder="Adin Soyadın" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>E-posta</label>
            <input type="email" placeholder="ornek@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Sifre</label>
            <input type="password" placeholder="Guclu bir sifre girin" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {/* SIFRE KURAL GOSTERGESI */}
          {password.length > 0 && (
            <div className="password-rules">
              <p style={{fontSize:"0.75rem", color:"#6b6b80", marginBottom:"6px", fontWeight:"500"}}>Sifre kurallari:</p>
              {rules.map((rule, i) => (
                <p key={i} style={{fontSize:"0.73rem", color: rule.test(password) ? "#4ade80" : "#f87171", marginBottom:"2px"}}>
                  {rule.test(password) ? "✓" : "✗"} {rule.label}
                </p>
              ))}
            </div>
          )}

          <div className="form-group">
            <label>Sifre Tekrar</label>
            <input type="password" placeholder="Sifreni tekrar gir" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : "Kayit Ol"}
          </button>
        </form>

        <p className="auth-switch">
          Zaten hesabin var mi? <Link to="/login">Giris yap</Link>
        </p>
      </div>
    </div>
  );
}
