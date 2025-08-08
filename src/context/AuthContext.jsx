import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';

// Initial context
const AuthContext = createContext({
  token: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  openAuthModal: () => {},
  closeAuthModal: () => {},
  authModalOpen: false,
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load token from localStorage on mount (client-side only)
  useEffect(() => {
    if (mounted) {
      const stored = localStorage.getItem('token');
      if (stored) setToken(stored);
    }
  }, [mounted]);

  const handleAuthResponse = useCallback((data) => {
    if (data && data.token) {
      setToken(data.token);
      if (mounted) {
        localStorage.setItem('token', data.token);
      }
      setAuthModalOpen(false);
      // Redirect to home after successful login
      router.push('/');
    }
  }, [mounted, router]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5321/api/v1/auth/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Login failed');
      handleAuthResponse(data);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ firstName, lastName, email, password }) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5321/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `${firstName} ${lastName}`.trim(), email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Registration failed');
      handleAuthResponse(data);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    if (mounted) {
      localStorage.removeItem('token');
    }
    router.push('/login');
  };

  const openAuthModal = () => setAuthModalOpen(true);
  const closeAuthModal = () => setAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
        openAuthModal,
        closeAuthModal,
        authModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);