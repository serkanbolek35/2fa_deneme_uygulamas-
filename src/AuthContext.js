import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [awaitingTwoFA, setAwaitingTwoFAState] = useState(
    () => sessionStorage.getItem("awaitingTwoFA") === "true"
  );

  function setAwaitingTwoFA(val) {
    sessionStorage.setItem("awaitingTwoFA", val ? "true" : "false");
    setAwaitingTwoFAState(val);
  }

  function register(email, password, displayName) {
    return createUserWithEmailAndPassword(auth, email, password).then((res) =>
      updateProfile(res.user, { displayName })
    );
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    setAwaitingTwoFA(false);
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = { currentUser, register, login, logout, awaitingTwoFA, setAwaitingTwoFA };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
