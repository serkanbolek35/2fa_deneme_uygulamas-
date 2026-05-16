import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import guvenlikImg from "../guvenlik.jpg";

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
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);

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
      setMessage("2FA basariyla aktif edildi!");
    } else {
      setMessage("Kod yanlis, tekrar dene.");
    }
  }

  async function disable2FA() {
    await setDoc(doc(db, "users", currentUser.uid), {
      twoFAEnabled: false,
      twoFASecret: "",
    });
    setTwoFAEnabled(false);
    setMessage("2FA devre disi birakildi.");
  }

  const initials = currentUser?.displayName
    ? currentUser.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : currentUser?.email?.[0].toUpperCase();

  if (loading) return (
    <div className="dashboard-container" style={{display:"flex",alignItems:"center",justifyContent:"center",color:"#6b6b80"}}>
      Yukleniyor...
    </div>
  );

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-logo">MyApp</div>
        <button className="logout-btn" onClick={handleLogout}>Cikis Yap</button>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-card">
          <div className="avatar">{initials}</div>
          <div className="welcome-text">
            <h1>Hosgeldin, {currentUser?.displayName || "Kullanici"}!</h1>
            <p>{currentUser?.email}</p>
          </div>
        </div>

        {/* 2FA KARTI */}
        <div className="stat-card" style={{marginTop:"1rem", flexDirection:"column", alignItems:"flex-start", gap:"1rem", padding:"1.5rem"}}>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%"}}>
            <div style={{display:"flex", alignItems:"center", gap:"0.75rem"}}>
              <span className="stat-icon">🔐</span>
              <div>
                <p className="stat-label">Iki Faktorlu Dogrulama (2FA)</p>
                <p className="stat-value" style={{color: twoFAEnabled ? "#4ade80" : "#f87171"}}>
                  {twoFAEnabled ? "Aktif" : "Pasif"}
                </p>
              </div>
            </div>
            {!twoFAEnabled ? (
              <button className="auth-btn" style={{width:"auto", padding:"0.5rem 1.25rem", marginTop:0}} onClick={setup2FA}>
                Aktif Et
              </button>
            ) : (
              <button className="logout-btn" onClick={disable2FA}>
                Devre Disi Birak
              </button>
            )}
          </div>

          {message && (
            <p style={{fontSize:"0.85rem", color: message.includes("basariyla") ? "#4ade80" : message.includes("yanlis") ? "#f87171" : "#6b6b80"}}>
              {message}
            </p>
          )}

          {showSetup && (
            <div style={{width:"100%", borderTop:"1px solid #1e1e2e", paddingTop:"1rem"}}>
              <p style={{fontSize:"0.85rem", color:"#e8e8f0", marginBottom:"0.75rem"}}>
                1. Microsoft Authenticator veya Google Authenticator uygulamasini ac
              </p>
              <p style={{fontSize:"0.85rem", color:"#e8e8f0", marginBottom:"0.75rem"}}>
                2. Asagidaki QR kodu tara
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
                  Dogrula
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SIBER GUVENLIK BILGI KARTI */}
        <div className="stat-card" style={{marginTop:"1rem", flexDirection:"column", alignItems:"flex-start", gap:"1rem", padding:"1.5rem"}}>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%"}}>
            <div style={{display:"flex", alignItems:"center", gap:"0.75rem"}}>
              <span className="stat-icon">🛡️</span>
              <div>
                <p className="stat-label">Sifre Guvenligi ve Siber Tehditler</p>
                <p className="stat-value" style={{fontSize:"0.85rem"}}>Credential Stuffing Hakkinda</p>
              </div>
            </div>
            <button
              className="auth-btn"
              style={{width:"auto", padding:"0.5rem 1.25rem", marginTop:0}}
              onClick={() => setShowSecurityInfo(!showSecurityInfo)}
            >
              {showSecurityInfo ? "Kapat" : "Bilgi Al"}
            </button>
          </div>

          {showSecurityInfo && (
            <div style={{width:"100%", borderTop:"1px solid #1e1e2e", paddingTop:"1rem"}}>
              {twoFAEnabled ? (
                <div>
                  <p style={{fontSize:"0.875rem", color:"#4ade80", fontWeight:"600", marginBottom:"1rem"}}>
                    ✅ Hesabiniz 2FA ile korunmaktadir. Credential stuffing saldirilarina karsi guvendesiniz!
                  </p>
                  <img
                    src={guvenlikImg}
                    alt="Siber Guvenlik"
                    style={{width:"100%", maxWidth:"480px", borderRadius:"12px", marginBottom:"1.25rem", display:"block"}}
                  />
                  <div className="security-info-box">
                    <h3 style={{color:"#e8e8f0", fontSize:"0.95rem", marginBottom:"0.6rem"}}>⚠️ Credential Stuffing Nedir?</h3>
                    <p style={{fontSize:"0.82rem", color:"#aaaacc", lineHeight:"1.7", marginBottom:"1rem"}}>
                      Credential stuffing, onceden ele gecirilmis kullanici adi ve sifre bilgilerinin farkli platformlarda otomatik olarak denenmesiyle gerceklestirilen bir siber saldiri turudur. Saldirganlar bot sistemleri araciligiyla binlerce hesaba saniyeler icinde erismeye calisir.
                    </p>
                    <h3 style={{color:"#e8e8f0", fontSize:"0.95rem", marginBottom:"0.6rem"}}>🔐 2FA Sizi Nasil Korur?</h3>
                    <p style={{fontSize:"0.82rem", color:"#aaaacc", lineHeight:"1.7", marginBottom:"1rem"}}>
                      Iki faktorlu dogrulama ile saldirganlar sifrenizi bilse dahi hesabiniza erisemez. Giris icin telefonunuzdaki 6 haneli kod da gereklidir ve bu kod her 30 saniyede bir degisir.
                    </p>
                    <h3 style={{color:"#e8e8f0", fontSize:"0.95rem", marginBottom:"0.6rem"}}>🛡️ Guvenli Sifre Onerileri</h3>
                    <p style={{fontSize:"0.82rem", color:"#aaaacc", lineHeight:"1.8"}}>
                      • En az 8 karakter kullanin<br/>
                      • Buyuk ve kucuk harf karistirin<br/>
                      • Rakam ve ozel karakter ekleyin (!@#$)<br/>
                      • Her platform icin farkli sifre belirleyin<br/>
                      • Sifrenizi kimseyle paylasmayın
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{textAlign:"center", padding:"1.5rem 1rem"}}>
                  <p style={{fontSize:"2rem", marginBottom:"0.75rem"}}>⚠️</p>
                  <p style={{fontSize:"0.95rem", color:"#f87171", fontWeight:"600", marginBottom:"0.5rem"}}>
                    2FA Aktif Edilmedi!
                  </p>
                  <p style={{fontSize:"0.82rem", color:"#aaaacc", lineHeight:"1.7"}}>
                    Hesabiniz credential stuffing saldirilarına karsi savunmasiz olabilir. Lutfen yukaridaki "Aktif Et" butonuna tiklayarak 2FA'yi aktif edin ve hesabinizi koruma altina alin.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="stats-grid" style={{marginTop:"1rem"}}>
          <div className="stat-card">
            <span className="stat-icon">📅</span>
            <div>
              <p className="stat-label">Kayit Tarihi</p>
              <p className="stat-value">
                {new Date(currentUser?.metadata?.creationTime).toLocaleDateString("tr-TR")}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⚡</span>
            <div>
              <p className="stat-label">Son Giris</p>
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
