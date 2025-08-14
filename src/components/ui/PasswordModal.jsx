import React, { useState } from 'react';
import { usePasskey } from '../../context/PasskeyContext';

const PasswordModal = ({ open, onClose, onSuccess, isSet }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setPassword: createPasskey, checkPasskey } = usePasskey();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!isSet) {
        const result = await createPasskey(password);
        if (!result.success) throw new Error(result.message || 'Failed to set password');
      } else {
        const result = await checkPasskey();
        if (!result.success) throw new Error(result.message || 'Failed to fetch passkey');
      }
      setPassword('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1030] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-card p-8 rounded-lg shadow-modal w-full max-w-md space-y-6 relative">
        <button type="button" onClick={onClose} className="absolute top-2 right-2 text-xl">×</button>
        <h2 className="text-xl font-bold mb-2 text-foreground">{isSet ? 'Enter Your Password' : 'Set Your Password'}</h2>
        <p className="text-foreground mb-4">{isSet ? 'Please enter your password to unlock note creation.' : 'Create a password before creating notes.'}</p>
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
          {loading ? (isSet ? 'Checking...' : 'Setting...') : (isSet ? 'Unlock' : 'Set Password')}
        </button>
      </form>
    </div>
  );
};

export default PasswordModal;
