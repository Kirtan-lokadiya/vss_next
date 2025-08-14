import React, { useState } from 'react';
import { useAuth } from '../src/context/AuthContext';
import { useRouter } from 'next/router';

const PasswordSetupPage = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Use local proxy route defined in next.config.js
  const SECURITY_BASE = `/api/security`;
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${SECURITY_BASE}/passkeys?password=${encodeURIComponent(password)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to set password');
      // After success, redirect to notes or wherever needed
      router.replace('/ideas-whiteboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-card p-8 rounded-lg shadow-card w-full max-w-md space-y-6">
        <h2 className="text-xl font-bold mb-2 text-foreground">Set Your Password</h2>
        <p className="text-foreground mb-4">Please create a password before creating notes.</p>
        <input
          type="password"
          className="w-full px-4 py-2 rounded border border-input bg-background dark:bg-[#23272f] text-foreground dark:text-white"
          placeholder="Enter password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-error text-sm">{error}</p>}
        <button type="submit" className="w-full py-2 rounded bg-primary text-white font-semibold" disabled={loading}>
          {loading ? 'Setting...' : 'Set Password'}
        </button>
      </form>
    </div>
  );
};

export default PasswordSetupPage;
