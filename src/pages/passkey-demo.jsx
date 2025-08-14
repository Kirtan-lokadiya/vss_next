import React, { useState } from 'react';
import { usePasskey } from '../context/PasskeyContext';
import { useAuth } from '../context/AuthContext';
// Demo page no longer required in prod; keep minimal guard to avoid dead imports
// You can delete this page if not needed
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { encryptMessage, decryptMessage, isPasskeyAvailable } from '../utils/encryption';

const PasskeyDemo = () => {
  const { isAuthenticated } = useAuth();
  const { isPasskeySet, checkPasskey } = usePasskey();
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEncrypt = async () => {
    if (!message.trim()) return;
    
    setIsProcessing(true);
    try {
      const encrypted = await encryptMessage(message);
      if (encrypted) {
        setEncryptedMessage(encrypted);
        setDecryptedMessage('');
      }
    } catch (error) {
      console.error('Encryption failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    if (!encryptedMessage.trim() || !password.trim()) return;
    
    setIsProcessing(true);
    try {
      const decrypted = await decryptMessage(encryptedMessage, password);
      if (decrypted) {
        setDecryptedMessage(decrypted);
      }
    } catch (error) {
      console.error('Decryption failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRefresh = async () => {
    await checkPasskey();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please log in to access the passkey demo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Passkey Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            This demo showcases the passkey functionality for encrypted messaging. 
            Set your password to generate cryptographic keys and test encryption/decryption.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Passkey Status */}
          <PasskeyStatus />

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="w-full"
              >
                Refresh Passkey Status
              </Button>
              
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
        </div>

        {/* Encryption Demo */}
        {isPasskeySet && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Encryption Demo
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Encryption */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">
                  Encrypt Message
                </h4>
                <Input
                  placeholder="Enter message to encrypt"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full"
                />
                <Button
                  onClick={handleEncrypt}
                  disabled={!message.trim() || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? 'Encrypting...' : 'Encrypt'}
                </Button>
                
                {encryptedMessage && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Encrypted Message:
                    </label>
                    <textarea
                      value={encryptedMessage}
                      readOnly
                      className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 text-sm font-mono"
                      rows={3}
                    />
                  </div>
                )}
              </div>

              {/* Decryption */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">
                  Decrypt Message
                </h4>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
                <Button
                  onClick={handleDecrypt}
                  disabled={!encryptedMessage.trim() || !password.trim() || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? 'Decrypting...' : 'Decrypt'}
                </Button>
                
                {decryptedMessage && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Decrypted Message:
                    </label>
                    <div className="w-full p-2 border rounded-md bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                      <p className="text-green-800 dark:text-green-200 text-sm">
                        {decryptedMessage}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> This is a demo implementation. The actual encryption/decryption 
                functions need to be implemented according to your backend's cryptographic scheme. 
                Currently, they use placeholder logic for demonstration purposes.
              </p>
            </div>
          </div>
        )}

        {/* Notes Manager Demo */}
        <div className="mt-8">
          <NotesManager />
        </div>

        {/* Technical Details */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Technical Details
          </h3>
          
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">API Endpoints:</h4>
              <ul className="space-y-1 ml-4">
                <li><code>GET /api/v1/security/passkeys-user</code> - Check if passkey exists</li>
                <li><code>POST /api/v1/security/passkeys?password=XXXX</code> - Set password and generate passkey</li>
                <li><code>GET /api/v1/notes/?page=1&size=5</code> - Get notes with pagination</li>
                <li><code>POST /api/v1/notes/</code> - Create new note (encrypted or regular)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Stored Data:</h4>
              <ul className="space-y-1 ml-4">
                <li>Public Key - for encrypting messages</li>
                <li>Encrypted Private Key - for decrypting messages</li>
                <li>Salt & IV - cryptographic parameters</li>
                <li>Checksum - for data integrity</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Security Features:</h4>
              <ul className="space-y-1 ml-4">
                <li>Keys are stored encrypted in localStorage</li>
                <li>Password is never stored, only used for key generation</li>
                <li>Automatic passkey validation on authentication</li>
                <li>Secure API communication with Bearer tokens</li>
                <li>Note content encryption using stored passkey</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <PasskeyModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          // Refresh the page or update state
          window.location.reload();
        }}
      />
    </div>
  );
};

export default PasskeyDemo; 