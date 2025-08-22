import React, { useState } from 'react';
import { usePasskey } from '../../context/PasskeyContext';
import { useToast } from '../../context/ToastContext';

const PasswordModal = ({ open, onClose, onSuccess, isSet, error }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setPassword: createPasskey, checkPasskey } = usePasskey();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!isSet) {
        const result = await createPasskey(password);
        if (!result.success) {
          showToast(result.message || 'Failed to set password', 'error');
          return;
        }
        // Set password success - close modal and call success
        const pwd = password;
        setPassword('');
        onSuccess?.(pwd);
        onClose();
      } else {
        // For unlock - just pass password to parent, let parent handle validation
        const pwd = password;
        setPassword('');
        onSuccess?.(pwd);
        // Don't close modal - parent will close it only on success
      }
    } catch (err) {
      // Show errors as toast messages
      showToast(err.message || 'An unexpected error occurred', 'error');
      console.error('Password modal error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm" style={{ top: '64px' }}>
      <form onSubmit={handleSubmit} className="bg-card p-8 rounded-2xl shadow-modal w-full max-w-md space-y-6 relative">
        {/* Close removed as requested */}
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
