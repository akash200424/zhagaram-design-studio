import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("zhagaram_token") || null,
  );
  const [loading, setLoading] = useState(true);
  const [isCheckedIn, setIsCheckedIn] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("zhagaram_token");
      const savedUser = localStorage.getItem("zhagaram_user");

      // Purge legacy "arvinth" cached session if present
      if (savedUser && savedUser.includes("karthi")) {
        localStorage.removeItem("zhagaram_token");
        localStorage.removeItem("zhagaram_user");
      }

      const activeToken = localStorage.getItem("zhagaram_token");
      const activeUser = localStorage.getItem("zhagaram_user");

      if (activeToken && activeUser) {
        try {
          setUser(JSON.parse(activeUser));
          setToken(activeToken);
          const res = await authAPI.getMe();
          if (res.data?.data) {
            setUser(res.data.data);
            setIsCheckedIn(res.data.data.isCheckedIn ?? true);
            localStorage.setItem(
              "zhagaram_user",
              JSON.stringify(res.data.data),
            );
          }
        } catch (err) {
          console.error("Session verification error", err);
        }
      } else {
        // Auto-login with default Karthi (Founder) credentials
        try {
          const res = await authAPI.login({
            email: "zhagaramprojects@gmail.com",
            password: "admin",
          });
          if (res.data?.data) {
            const data = res.data.data;
            setUser(data);
            setToken(data.token);
            setIsCheckedIn(data.isCheckedIn ?? true);
            localStorage.setItem("zhagaram_token", data.token);
            localStorage.setItem("zhagaram_user", JSON.stringify(data));
          }
        } catch (e) {
          console.warn("Auto-login fallback skipped:", e.message);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data && res.data.data) {
      const data = res.data.data;
      setUser(data);
      setToken(data.token);
      setIsCheckedIn(data.isCheckedIn ?? true);
      localStorage.setItem("zhagaram_token", data.token);
      localStorage.setItem("zhagaram_user", JSON.stringify(data));
      return data;
    }
    throw new Error("Failed to login");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("zhagaram_token");
    localStorage.removeItem("zhagaram_user");
  };

  const toggleCheckIn = async () => {
    try {
      const res = await authAPI.toggleCheckIn();
      if (res.data?.success) {
        setIsCheckedIn(res.data.isCheckedIn);
        setUser((prev) =>
          prev ? { ...prev, isCheckedIn: res.data.isCheckedIn } : null,
        );
      }
    } catch (e) {
      console.error("Error toggling checkin", e);
      setIsCheckedIn(!isCheckedIn);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        isCheckedIn,
        login,
        logout,
        toggleCheckIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
