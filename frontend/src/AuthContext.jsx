import React, { createContext, useState, useContext, useEffect } from "react";
import { API_BASE } from "./config";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      fetchCurrentUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (authToken) => {
    const tokenToUse = authToken || token;
    console.log('🔍 Fetching current user with token:', tokenToUse ? 'Present' : 'Missing');
    
    if (!tokenToUse) {
      console.log('⚠️ No token available');
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { 
          'Authorization': `Bearer ${tokenToUse}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('📡 Response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('✅ User data received:', data);
        setUser(data);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('❌ Auth failed:', res.status, errorData);
        logout(); // This is correct, it logs out on a bad token
      }
    } catch (err) {
      console.error("❌ Error fetching user:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (newToken, userData) => {
    console.log('🔐 Login called with token:', newToken ? 'Present' : 'Missing');
    console.log('👤 User data:', userData);
    
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    console.log('🚪 Logout called');
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };
  
  // --- THIS IS THE NEW FUNCTION ---
  // This function only updates the user state, not the token.
  const updateUser = (newUserData) => {
    console.log('🔄 Updating user data:', newUserData);
    setUser(newUserData);
  };
  // --- END OF NEW FUNCTION ---

  return (
    // --- ADD updateUser to the value ---
    <AuthContext.Provider value={{ user, token, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};