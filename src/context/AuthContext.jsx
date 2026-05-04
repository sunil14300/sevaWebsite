import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("seva_token"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("seva_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (tokenValue, userData) => {
    localStorage.setItem("seva_token", tokenValue);
    localStorage.setItem("seva_user", JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("seva_token");
    localStorage.removeItem("seva_user");
    setToken(null);
    setUser(null);
  };

  const isLoggedIn = !!token;
  const isCustomer = user?.role === "customer";
  const isWorker = user?.role === "worker";
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ token, user, isLoggedIn, isCustomer, isWorker, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
