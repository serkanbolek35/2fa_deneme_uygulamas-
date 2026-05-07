import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import "./App.css";

function PrivateRoute({ children }) {
  const { currentUser, awaitingTwoFA } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  if (awaitingTwoFA) return <Navigate to="/login" />;
  return children;
}

function PublicRoute({ children }) {
  const { currentUser, awaitingTwoFA } = useAuth();
  // Kullanıcı giriş yapmış VE 2FA beklemiyor → dashboard'a gönder
  if (currentUser && !awaitingTwoFA) return <Navigate to="/dashboard" />;
  // Diğer tüm durumlar (giriş yok, veya 2FA bekleniyor) → login'de kal
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
