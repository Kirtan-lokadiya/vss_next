import React, { useState } from 'react';
import { usePasskey } from '../../context/PasskeyContext';
import PasskeyModal from './PasskeyModal';
import Button from './Button';

const PasskeyStatus = ({ className = '' }) => {
  const { isPasskeySet, isLoading, checkPasskey } = usePasskey();
  const [showModal, setShowModal] = useState(false);

  const handleRefresh = async () => {
    await checkPasskey();
  };

  return (
    <>
      <div className={`bg-white dark:bg-gray-800 rounded-lg border p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Passkey Status
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-xs"
          >
            {isLoading ? 'Checking...' : 'Refresh'}
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isPasskeySet ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {isPasskeySet ? 'Passkey is set' : 'Passkey not set'}
            </span>
          </div>

          {isPasskeySet ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <p className="text-sm text-green-800 dark:text-green-200">
                Your cryptographic keys are securely stored and ready for encrypted messaging.
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                You need to set a password to generate your passkey for encrypted messaging.
              </p>
            </div>
          )}

          {!isPasskeySet && (
            <Button
              onClick={() => setShowModal(true)}
              className="w-full"
            >
              Set Password
            </Button>
          )}
        </div>
      </div>

      <PasskeyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          // Modal will close automatically on success
        }}
      />
    </>
  );
};

export default PasskeyStatus; 