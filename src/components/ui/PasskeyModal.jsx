import React, { useState } from 'react';
import { usePasskey } from '../../context/PasskeyContext';
import { useToast } from '../../context/ToastContext';
import Button from './Button';
import Input from './Input';

const PasskeyModal = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setPassword: createPasskey } = usePasskey();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (password.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }
    
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createPasskey(password);
      
      if (result.success) {
        showToast('Password set successfully! Your passkey has been generated.', 'success');
        setPassword('');
        setConfirmPassword('');
        onSuccess?.(result.passkey);
        onClose();
      } else {
        showToast(result.message || 'Failed to set password', 'error');
      }
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
      console.error('Error setting password:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setPassword('');
      setConfirmPassword('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Set Your Password
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={8}
              disabled={isSubmitting}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 8 characters required
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              disabled={isSubmitting}
              className="w-full"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Important:</strong> This password will be used to encrypt your private key. 
              Make sure to remember it as it cannot be recovered.
            </p>
          </div>

          <div className="flex space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !password || !confirmPassword}
              className="flex-1"
            >
              {isSubmitting ? 'Setting Password...' : 'Set Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasskeyModal; 