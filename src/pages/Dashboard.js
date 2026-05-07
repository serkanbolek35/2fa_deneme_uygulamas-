import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check2FA() {
      const ref = doc(db, "users", currentUser.uid);
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data().twoFAEnabled) {
        setTwoFAEnabled(true);
      }
      setLoading(false);
    }
    check2FA();
  }, [currentUser]);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  async function setup2FA() {
    const totp = new OTPAuth.TOTP({
      issuer: "MyApp",
      label: currentUser.email,
      digits: 6,
    });
    const newSecret = totp.secret.base32;
    setSecret(newSecret);
    const otpauth = totp.toString();
    const url = await QRCode.toDataURL(otpauth);
    setQrUrl(url);
    setShowSetup(true);
    setMessage("");
  }

  async function verify2FA() {
    const totp = new OTPAuth.TOTP({ secret: secret, digits: 6 });
    const delta = totp.validate({ token: verifyCode, window: 1 });

    if (delta !== null) {
      await setDoc(doc(db, "users", currentUser.uid), {
        twoFAEnabled: true,
        twoFASecret: secret,
      });
      setTwoFAEnabled(true);
      setShowSetup(false);
      setMessage("✅ 2FA başarıyla aktif edildi!");
    } else {
      setMessage("❌ Kod yanlış, tekrar dene.");
    }
  }

  async function disable2FA() {
    await setDoc(doc(db, "users", currentUser.uid), {
      twoFAEnabled: false,
      twoFASecret: "",
    });
    setTwoFAEnabled(false);
    setMessage("2FA devre dışı bırakıldı.");
  }

  const initials = currentUser?.displayName
    ? currentUser.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : currentUser?.email?.[0].toUpperCase();

  if (loading) return <div className="dashboard-container" style={{display:"flex",alignItems:"center",justifyContent:"center",color:"#6b6b80"}}>Yükleniyor...</div>;

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-logo">⬡ MyApp</div>
        <button className="logout-btn" onClick={handleLogout}>Çıkış Yap</button>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-card">
          <div className="avatar">{initials}</div>
          <div className="welcome-text">
            <h1>Hoşgeldin, {currentUser?.displayName || "Kullanıcı"}! 👋</h1>
            <p>{currentUser?.email}</p>
          </div>
        </div>

        {/* 2FA KARTI */}
        <div className="stat-card" style={{marginTop:"1rem", flexDirection:"column", alignItems:"flex-start", gap:"1rem", padding:"1.5rem"}}>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%"}}>
            <div style={{display:"flex", alignItems:"center", gap:"0.75rem"}}>
              <span className="stat-icon">🔐</span>
              <div>
                <p className="stat-label">İki Faktörlü Doğrulama (2FA)</p>
                <p className="stat-value" style={{color: twoFAEnabled ? "#4ade80" : "#f87171"}}>
                  {twoFAEnabled ? "✅ Aktif" : "❌ Pasif"}
                </p>
              </div>
            </div>
            {!twoFAEnabled ? (
              <button className="auth-btn" style={{width:"auto", padding:"0.5rem 1.25rem", marginTop:0}} onClick={setup2FA}>
                Aktif Et
              </button>
            ) : (
              <button className="logout-btn" onClick={disable2FA}>
                Devre Dışı Bırak
              </button>
            )}
          </div>

          {message && (
            <p style={{fontSize:"0.85rem", color: message.includes("✅") ? "#4ade80" : message.includes("❌") ? "#f87171" : "#6b6b80"}}>
              {message}
            </p>
          )}

          {showSetup && (
            <div style={{width:"100%", borderTop:"1px solid #1e1e2e", paddingTop:"1rem"}}>
              <p style={{fontSize:"0.85rem", color:"#e8e8f0", marginBottom:"0.75rem"}}>
                1. Microsoft Authenticator veya Google Authenticator uygulamasını aç
              </p>
              <p style={{fontSize:"0.85rem", color:"#e8e8f0", marginBottom:"0.75rem"}}>
                2. Aşağıdaki QR kodu tara
              </p>
              {qrUrl && (
                <img src={qrUrl} alt="QR Code" style={{width:"180px", height:"180px", borderRadius:"8px", marginBottom:"1rem", background:"white", padding:"8px"}} />
              )}
              <p style={{fontSize:"0.85rem", color:"#e8e8f0", marginBottom:"0.5rem"}}>
                3. Uygulamadan gelen 6 haneli kodu gir
              </p>
              <div style={{display:"flex", gap:"0.75rem", alignItems:"center"}}>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  style={{background:"rgba(255,255,255,0.05)", border:"1px solid #1e1e2e", borderRadius:"8px", padding:"0.5rem 0.75rem", color:"#e8e8f0", fontSize:"1rem", letterSpacing:"0.2em", width:"140px", fontFamily:"monospace"}}
                />
                <button className="auth-btn" style={{width:"auto", padding:"0.5rem 1.25rem", marginTop:0}} onClick={verify2FA}>
                  Doğrula
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="stats-grid" style={{marginTop:"1rem"}}>
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
