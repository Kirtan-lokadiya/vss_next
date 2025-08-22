import React, { useState, useEffect } from 'react';
import { useWhiteboard } from '../../context/WhiteboardContext';
import { useToast } from '../../context/ToastContext';

const WhiteboardPasswordModal = ({ open, onClose }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);

  const { setupPasskey, unlockWhiteboard, isPasswordSet } = useWhiteboard();
  const { showToast } = useToast();

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setPassword('');
      setLoading(false);
      // If password is already set, always use unlock mode
      setIsSetupMode(!isPasswordSet);
    }
  }, [open, isPasswordSet]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password.trim()) {
      showToast('Please enter a password', 'error');
      return;
    }

    setLoading(true);

    try {
      if (isSetupMode) {
        // Setup passkey mode
        const result = await setupPasskey(password);
        
        if (!result.success) {
          showToast(result.message || 'Failed to setup password', 'error');
          return;
        }
        
        if (result.alreadySet) {
          // If already set, switch to unlock mode
          setIsSetupMode(false);
        } else {
          // Setup successful, now unlock and wait for completion
          const unlockResult = await unlockWhiteboard(password);
          if (!unlockResult.success) {
            showToast(unlockResult.message || 'Failed to unlock whiteboard', 'error');
            return;
          }
          // Only close modal after successful unlock and loadAllNotes completion
          onClose();
        }
      } else {
        // Unlock mode - wait for both password verification and loadAllNotes to complete
        const unlockResult = await unlockWhiteboard(password);
        if (!unlockResult.success) {
          showToast(unlockResult.message || 'Invalid password, please try again', 'error');
          return;
        }
        // Only close modal after successful unlock and loadAllNotes completion
        onClose();
      }
    } catch (err) {
      console.error('Password modal error:', err);
      // Show user-friendly error messages as toast
      if (err.message === 'Invalid password' || err.message === 'Wrong password') {
        showToast('Invalid password. Please try again.', 'error');
      } else {
        showToast(err.message || 'Authentication failed. Please try again.', 'error');
      }
      // Don't close modal - let user try again
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSetupMode(!isSetupMode);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card p-8 rounded-2xl shadow-modal w-full max-w-md space-y-6 relative">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2 text-foreground">
            {isSetupMode ? 'Setup Whiteboard Security' : 'Unlock Whiteboard'}
          </h2>
          <p className="text-foreground/80 text-sm">
            {isSetupMode
              ? 'Set up security for your whiteboard notes'
              : 'Enter your password to access your notes'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>



          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                {isSetupMode ? 'Setting up...' : 'Unlocking...'}
              </div>
            ) : (
              isSetupMode ? 'Setup Security' : 'Unlock Whiteboard'
            )}
          </button>
        </form>

        {/* Toggle between setup and unlock modes - only show when password is not set */}
        {!isPasswordSet && (
          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
              disabled={loading}
            >
              {isSetupMode ? 'Already have a password? Unlock instead' : 'Need to setup security? Setup instead'}
            </button>
          </div>
        )}

        {/* Info about password */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-700 text-xs">
            <strong>Security Notice:</strong> Your password is securely hashed and stored locally.
            Notes are encrypted and synced with the server automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhiteboardPasswordModal;