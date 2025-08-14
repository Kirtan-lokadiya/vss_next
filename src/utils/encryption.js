// Encryption utilities using stored passkey
// This file provides functions for encrypting/decrypting messages using the user's passkey

/**
 * Get the stored passkey from localStorage
 * @returns {Object|null} The passkey object or null if not found
 */
export const getStoredPasskey = () => {
  try {
    const stored = localStorage.getItem('passkey');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading stored passkey:', error);
    return null;
  }
};

/**
 * Check if passkey is available
 * @returns {boolean} True if passkey is available
 */
export const isPasskeyAvailable = () => {
  return !!getStoredPasskey();
};

/**
 * Get the public key for encryption
 * @returns {string|null} The public key or null if not available
 */
export const getPublicKey = () => {
  const passkey = getStoredPasskey();
  return passkey?.publicKey || null;
};

/**
 * Get the encrypted private key
 * @returns {string|null} The encrypted private key or null if not available
 */
export const getEncryptedPrivateKey = () => {
  const passkey = getStoredPasskey();
  return passkey?.encryptedPrivateKey || null;
};

/**
 * Get the salt and IV for decryption
 * @returns {Object|null} Object with salt and iv, or null if not available
 */
export const getDecryptionParams = () => {
  const passkey = getStoredPasskey();
  if (!passkey) return null;
  
  return {
    salt: passkey.salt,
    iv: passkey.iv,
    encryptedPrivateKey: passkey.encryptedPrivateKey,
    encryptedChecksum: passkey.encryptedChecksum
  };
};

/**
 * Encrypt a message using the stored public key
 * Note: This is a placeholder for the actual encryption implementation
 * You'll need to implement the specific encryption algorithm your backend uses
 * @param {string} message - The message to encrypt
 * @returns {string|null} The encrypted message or null if encryption fails
 */
export const encryptMessage = async (message) => {
  try {
    const publicKey = getPublicKey();
    if (!publicKey) {
      throw new Error('Public key not available');
    }

    // TODO: Implement actual encryption using the public key
    // This will depend on your backend's encryption scheme
    // You might need to use Web Crypto API or a library like crypto-js
    
    console.log('Encrypting message with public key:', publicKey);
    console.log('Message to encrypt:', message);
    
    // Placeholder return - replace with actual encryption
    return `encrypted_${message}_${Date.now()}`;
  } catch (error) {
    console.error('Error encrypting message:', error);
    return null;
  }
};

/**
 * Decrypt a message using the stored private key
 * Note: This is a placeholder for the actual decryption implementation
 * You'll need to implement the specific decryption algorithm your backend uses
 * @param {string} encryptedMessage - The encrypted message to decrypt
 * @param {string} password - The user's password for decryption
 * @returns {string|null} The decrypted message or null if decryption fails
 */
export const decryptMessage = async (encryptedMessage, password) => {
  try {
    const decryptionParams = getDecryptionParams();
    if (!decryptionParams) {
      throw new Error('Decryption parameters not available');
    }

    // TODO: Implement actual decryption using the password and stored parameters
    // This will depend on your backend's decryption scheme
    
    console.log('Decrypting message with params:', decryptionParams);
    console.log('Encrypted message:', encryptedMessage);
    
    // Placeholder return - replace with actual decryption
    if (encryptedMessage.startsWith('encrypted_')) {
      return encryptedMessage.replace('encrypted_', '').split('_')[0];
    }
    return null;
  } catch (error) {
    console.error('Error decrypting message:', error);
    return null;
  }
};

/**
 * Validate that the stored passkey has all required fields
 * @returns {boolean} True if passkey is valid
 */
export const validatePasskey = () => {
  const passkey = getStoredPasskey();
  if (!passkey) return false;
  
  const requiredFields = ['publicKey', 'encryptedPrivateKey', 'encryptedChecksum', 'salt', 'iv'];
  return requiredFields.every(field => passkey[field]);
};

/**
 * Clear the stored passkey from localStorage
 */
export const clearStoredPasskey = () => {
  localStorage.removeItem('passkey');
};

/**
 * Export passkey data (for backup purposes)
 * @returns {Object|null} The passkey data or null if not available
 */
export const exportPasskey = () => {
  const passkey = getStoredPasskey();
  if (!passkey) return null;
  
  return {
    ...passkey,
    exportedAt: new Date().toISOString()
  };
}; 