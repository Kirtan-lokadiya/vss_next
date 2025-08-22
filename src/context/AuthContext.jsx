import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';

// Initial context
const AuthContext = createContext({
  token: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  verifyEmailToken: async () => {},
  logout: () => {},
  openAuthModal: () => {},
  closeAuthModal: () => {},
  authModalOpen: false,
  loading: false,
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5321';
  const AUTH_BASE = `${BASE_URL}/api/v1/auth`;

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

  const persistToken = useCallback((newToken) => {
    setToken(newToken);
    if (mounted) {
      localStorage.setItem('token', newToken);
    }
  }, [mounted]);

  const handleAuthResponse = useCallback((data) => {
    // Support different shapes: { token } or { jwtToken }
    const responseToken = data?.token || data?.jwtToken;
    if (responseToken) {
      persistToken(responseToken);
      setAuthModalOpen(false);
      // Always land on home after auth; passkey prompts are handled in specific pages
      router.push('/');
    }
  }, [persistToken, router]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${AUTH_BASE}/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data?.message || 'Login failed' };
      }
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
      const res = await fetch(`${AUTH_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `${firstName} ${lastName}`.trim(), email, password }),
      });
      const data = await res.json();
      // Treat any response with errors or message as failure, even if status is 200
      if (data?.errors || (data?.message && data?.message !== true)) {
        const errorMsg = data?.errors?.message || data?.message || 'Registration failed';
        return { success: false, message: errorMsg };
      }
      // API returns true and sends email; do not persist token yet
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailToken = async (jwtTokenFromLink) => {
    setLoading(true);
    try {
      const res = await fetch(`${AUTH_BASE}/verify?JWTToken=${encodeURIComponent(jwtTokenFromLink)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      let data;
      try {
        data = await res.json();
        console.log('Verify response:', data);
      } catch {
        // If response is not JSON, try to get text (token string)
        data = await res.text();
      }
      // Handle error response with errors object
      if (data?.errors) {
        const errorMsg = data?.errors?.message || 'Verification failed';
        return { success: false, message: errorMsg };
      }
      if (!res.ok) {
        return { success: false, message: data?.message || 'Verification failed' };
      }
      // If backend returns just the token string
      if (typeof data === 'string' && data.length > 20) {
        persistToken(data);
      } else if (data?.jwtToken) {
        persistToken(data.jwtToken);
      } else if (data?.token) {
        persistToken(data.token);
      }
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

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        verifyEmailToken,
        logout,
        openAuthModal: () => setAuthModalOpen(true),
        closeAuthModal: () => setAuthModalOpen(false),
        authModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);