import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

/** context container */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    /**inital no logged in user  */
  const [user, setUser] = useState(null);
  /** intial loa ding */
  const [loading, setLoading] = useState(true);
  
  /**login end point */
  const login = async (formData) => {
    const response = await api.post("/auth/login", formData);

    const { token, user } = response.data;

    localStorage.setItem("token", token);
    setUser(user);

    return response.data;
  };

  //**register end point */
  const register = async (formData) => {
    const response = await api.post("/auth/register", formData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const fetchMe = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get("/auth/me");
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        fetchMe,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}