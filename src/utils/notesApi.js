// Notes API service with passkey integration for encrypted messaging
import { getStoredPasskey } from './encryption';
import { decryptContent, CryptoUtils } from './CryptoUtils';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5321';
const NOTES_BASE = `${BASE_URL}/api/v1/notes`;
const SECURITY_BASE = `${BASE_URL}/api/v1/security`;

/**
 * Get notes with pagination (requires password)
 * @param {string} token - Authorization token
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 5)
 * @param {string} password - User's notes password (required)
 * @returns {Promise<Object>} Notes data
 */
export const getNotes = async (token, page = 1, size = 5, password) => {
  try {
    // Always verify passkey exists first
    const passkeyResponse = await fetch(`${SECURITY_BASE}/passkeys-user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    let passkeyData = null;
    try {
      passkeyData = await passkeyResponse.json();
    } catch {
      passkeyData = null;
    }

    if (!passkeyResponse.ok) {
      const message = (passkeyData && (passkeyData.errors?.message || passkeyData.message)) || `Failed to verify passkey (${passkeyResponse.status})`;
      const code = passkeyData?.customCode || passkeyData?.errors?.customCode || passkeyResponse.status;
      return { success: false, code, message, data: [] };
    }

    // If server indicates no key
    if (passkeyData?.errors?.message === 'Security Key Not Found') {
      return { success: false, code: 0, message: 'Password not set for notes. Please set your password first.', data: [] };
    }

    // Expect a valid passkey payload
    if (!passkeyData?.id || !passkeyData?.publicKey) {
      return { success: false, code: 0, message: 'Unexpected passkey response', data: [] };
    }

    // Require password before calling notes API
    if (!password) {
      return { success: false, code: 0, message: 'Password is required to fetch notes', data: [] };
    }

    const query = new URLSearchParams({ page: String(page), size: String(size) });
    if (password) query.append('password', password);
    const response = await fetch(`${NOTES_BASE}/?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    const code = data?.customCode || data?.errors?.customCode || null;
    const message = (data && (data.errors?.message || data.message)) || (!response.ok ? `Failed to fetch notes (${response.status})` : null);

    // Treat any payload that includes an errors object or missing notes array as error
    if (!response.ok || (data && data.errors) || !Array.isArray(data?.notes)) {
      return {
        success: false,
        code: code ?? (response.ok ? 0 : response.status),
        message: message || 'Failed to fetch notes',
        data: [],
      };
    }

    return { success: true, data: data.notes };
  } catch (error) {
    console.error('Error fetching notes:', error);
    return { success: false, code: 0, message: error.message, data: [] };
  }
};

/**
 * Create a new encrypted note
 * @param {string} token - Authorization token
 * @param {Object} noteData - Note data to create
 * @param {string} password - User's password for encryption
 * @returns {Promise<Object>} Creation result
 */
// Helper: decode JWT and extract userId
const decodeJwtPayload = (jwt) => {
  try {
    const [, payload] = jwt.split('.');
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
};

const getUserIdFromToken = (token) => {
  const payload = decodeJwtPayload(token || '');
  return payload.userId || payload.id || payload.sub || 0;
};

async function encryptNoteContentWithPasskey(plainText, passkey) {
  const publicKey = await CryptoUtils.RSAUtils.decodePublicKey(passkey.publicKey);
  return await CryptoUtils.RSAUtils.encryptWithPublicKey(plainText, publicKey);
}

export const createEncryptedNote = async (token, noteData) => {
  try {
    const passkey = getStoredPasskey();
    if (!passkey) {
      throw new Error('Passkey not available. Please set your password first.');
    }

    // Client-side RSA encryption with stored public key
    const encryptedContent = await encryptNoteContentWithPasskey(noteData.content, passkey);

    // Prepare the note payload with encrypted content
    const encryptedNotePayload = {
      userId: noteData.userId || getUserIdFromToken(token),
      content: encryptedContent,
      properties: noteData.properties || {
        x: 100,
        y: 100,
        z: 5,
        color: '#ffffff',
        height: 100,
        width: 200,
      },
    };

    const response = await fetch(`${NOTES_BASE}/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(encryptedNotePayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create note');
    }

    const createdNote = await response.json();
    return { success: true, note: createdNote };
  } catch (error) {
    console.error('Error creating encrypted note:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Create a regular (non-encrypted) note
 * @param {string} token - Authorization token
 * @param {Object} noteData - Note data to create
 * @returns {Promise<Object>} Creation result
 */
export const createNote = async (token, noteData) => {
  try {
    const response = await fetch(`${NOTES_BASE}/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok || payload?.errors) {
      const message = payload?.errors?.message || payload?.message || 'Failed to create note';
      const code = payload?.customCode || payload?.errors?.customCode || (response.ok ? 0 : response.status);
      throw Object.assign(new Error(message), { code });
    }

    return { success: true, note: payload };
  } catch (error) {
    console.error('Error creating note:', error);
    return { success: false, message: error.message, code: error.code };
  }
};

/**
 * Update an existing note
 * @param {string} token - Authorization token
 * @param {string} noteId - Note ID to update
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Update result
 */
export const updateNote = async (token, noteId, updateData) => {
  try {
    const response = await fetch(`${NOTES_BASE}/properties/${noteId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      let message = 'Failed to update note';
      let code = response.status;
      try {
        const errJson = await response.json();
        if (errJson?.errors?.message) message = errJson.errors.message;
        else if (errJson?.message) message = errJson.message;
        if (errJson?.customCode || errJson?.errors?.customCode) code = errJson.customCode || errJson?.errors?.customCode;
      } catch {
        const errText = await response.text().catch(() => '');
        if (errText) message = errText;
      }
      throw Object.assign(new Error(message), { code });
    }

    let result = null;
    try {
      result = await response.json();
    } catch {
      const txt = await response.text().catch(() => '');
      result = txt ? txt : true;
    }
    return { success: true, note: result };
  } catch (error) {
    console.error('Error updating note:', error);
    return { success: false, message: error.message, code: error.code };
  }
};

/**
 * Delete a note
 * @param {string} token - Authorization token
 * @param {string} noteId - Note ID to delete
 * @returns {Promise<Object>} Deletion result
 */
export const deleteNote = async (token, noteId) => {
  try {
    const response = await fetch(`${NOTES_BASE}/${noteId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok || payload?.errors) {
      const message = payload?.errors?.message || payload?.message || 'Failed to delete note';
      const code = payload?.customCode || payload?.errors?.customCode || (response.ok ? 0 : response.status);
      throw Object.assign(new Error(message), { code });
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting note:', error);
    return { success: false, message: error.message, code: error.code };
  }
};

/**
 * Encrypt note content using the stored passkey and user password
 * @param {string} content - Note content to encrypt
 * @param {string} password - User's password
 * @param {Object} passkey - Stored passkey data
 * @returns {Promise<string|null>} Encrypted content or null if failed
 */
const encryptNoteContent = async (content, password, passkey) => {
  try {
    // TODO: Implement actual encryption using the passkey and password
    // This is a placeholder implementation
    
    // For now, we'll use a simple encryption simulation
    // In production, you should implement proper encryption using:
    // 1. Derive encryption key from password + salt
    // 2. Use the derived key to decrypt the encryptedPrivateKey
    // 3. Use the decrypted private key for encryption
    
    console.log('Encrypting note content with passkey:', passkey.id);
    console.log('Content to encrypt:', content);
    console.log('Using password:', password ? '***' : 'not provided');
    
    // Placeholder encrypted content
    const encrypted = `encrypted_${btoa(content)}_${Date.now()}`;
    
    return encrypted;
  } catch (error) {
    console.error('Error encrypting note content:', error);
    return null;
  }
};

/**
 * Decrypt note content using the stored passkey and user password
 * @param {string} encryptedContent - Encrypted content to decrypt
 * @param {string} password - User's password
 * @returns {Promise<string|null>} Decrypted content or null if failed
 */
export const decryptNoteContent = async (encryptedContent, password) => {
  try {
    const passkey = getStoredPasskey();
    if (!passkey) throw new Error('Passkey not available');
    return await decryptContent(passkey, password, encryptedContent);
  } catch (error) {
    console.error('Error decrypting note content:', error);
    return null;
  }
};

/**
 * Check if a note is encrypted
 * @param {Object} note - Note object
 * @returns {boolean} True if note is encrypted
 */
export const isNoteEncrypted = (note) => {
  return note.encrypted === true && note.encryptionMetadata;
};

/**
 * Get note encryption metadata
 * @param {Object} note - Note object
 * @returns {Object|null} Encryption metadata or null if not encrypted
 */
export const getNoteEncryptionMetadata = (note) => {
  return isNoteEncrypted(note) ? note.encryptionMetadata : null;
}; 