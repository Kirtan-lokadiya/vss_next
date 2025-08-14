import React, { useState } from 'react';
import { useAuth } from '../src/context/AuthContext';
import { usePasskey } from '../src/context/PasskeyContext';
import { useRouter } from 'next/router';

const PasswordSetupPage = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const { token } = useAuth();
  const { setPassword: createPasskey } = usePasskey();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await createPasskey(password);
      if (!result.success) throw new Error(result.message || 'Failed to set password');
      router.replace('/');
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
