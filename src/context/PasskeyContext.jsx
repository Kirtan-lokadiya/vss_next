import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const PasskeyContext = createContext({
  passkey: null,
  isPasskeySet: false,
  isLoading: false,
  checkPasskey: async () => {},
  setPassword: async () => {},
  clearPasskey: () => {},
});

export const PasskeyProvider = ({ children }) => {
  const [passkey, setPasskey] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token, isAuthenticated } = useAuth();

  // Use Next.js rewrite proxy to avoid CORS and ensure same-origin cookies/headers
  const SECURITY_PROXY_BASE = `/api/security`;

  // Load passkey from localStorage on mount
  useEffect(() => {
    const storedPasskey = localStorage.getItem('passkey');
    if (storedPasskey) {
      try {
        const parsed = JSON.parse(storedPasskey);
        setPasskey(parsed);
      } catch (error) {
        console.error('Error parsing stored passkey:', error);
        localStorage.removeItem('passkey');
      }
    }
  }, []);

  // Check if passkey is set on the server
  const checkPasskey = useCallback(async () => {
    if (!token || !isAuthenticated) {
      return { success: false, message: 'Not authenticated' };
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${SECURITY_PROXY_BASE}/passkeys-user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      // Check if passkey exists by looking for the error response
      if (data.errors && data.errors.message === 'Security Key Not Found') {
        // Passkey not set
        return { success: true, isSet: false };
      } else if (data.id && data.publicKey) {
        // Passkey exists, store it
        const passkeyData = {
          id: data.id,
          publicKey: data.publicKey,
          encryptedPrivateKey: data.encryptedPrivateKey,
          encryptedChecksum: data.encryptedChecksum,
          salt: data.salt,
          iv: data.iv,
        };
        
        localStorage.setItem('passkey', JSON.stringify(passkeyData));
        setPasskey(passkeyData);
        
        return { success: true, passkey: passkeyData, isSet: true };
      } else {
        throw new Error('Unexpected response format from server');
      }
    } catch (error) {
      console.error('Error checking passkey:', error);
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated]);

  // Set password and create passkey
  const setPassword = useCallback(async (password) => {
    if (!token || !isAuthenticated) {
      return { success: false, message: 'Not authenticated' };
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${SECURITY_PROXY_BASE}/passkeys?password=${encodeURIComponent(password)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
console.log(response);
      if (response.ok) {
        const data = await response.json();
        // Store passkey in localStorage and state
        const passkeyData = {
          id: data.id,
          publicKey: data.publicKey,
          encryptedPrivateKey: data.encryptedPrivateKey,
          encryptedChecksum: data.encryptedChecksum,
          salt: data.salt,
          iv: data.iv,
        };
        
        localStorage.setItem('passkey', JSON.stringify(passkeyData));
        setPasskey(passkeyData);
        
        return { success: true, passkey: passkeyData };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set password');
      }
    } catch (error) {
      console.error('Error setting password:', error);
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated]);

  // Clear passkey from localStorage and state
  const clearPasskey = useCallback(() => {
    localStorage.removeItem('passkey');
    setPasskey(null);
  }, []);

  // Auto-check passkey when user authenticates
  useEffect(() => {
    if (isAuthenticated && token && !passkey) {
      checkPasskey();
    }
  }, [isAuthenticated, token, passkey, checkPasskey]);

  return (
    <PasskeyContext.Provider
      value={{
        passkey,
        isPasskeySet: !!passkey,
        isLoading,
        checkPasskey,
        setPassword,
        clearPasskey,
      }}
    >
      {children}
    </PasskeyContext.Provider>
  );
};

export const usePasskey = () => {
  const context = useContext(PasskeyContext);
  if (!context) {
    throw new Error('usePasskey must be used within a PasskeyProvider');
  }
  return context;
}; 