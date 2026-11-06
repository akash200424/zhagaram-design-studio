import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCheckedIn, setIsCheckedIn] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("zhagaram_token");

      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        setToken(savedToken);

        // Verify the saved token with the backend
        const res = await authAPI.getMe();

        if (!res.data?.data) {
          throw new Error("Invalid session");
        }

        const userData = res.data.data;

        setUser(userData);
        setIsCheckedIn(userData.isCheckedIn ?? true);

        localStorage.setItem("zhagaram_user", JSON.stringify(userData));
      } catch (err) {
        console.error("Session verification failed:", err);

        // Clear invalid or expired sessions
        localStorage.removeItem("zhagaram_token");
        localStorage.removeItem("zhagaram_user");

        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });

    if (res.data?.data?.token) {
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
    setIsCheckedIn(true);

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
      console.error("Error toggling checkin:", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
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
