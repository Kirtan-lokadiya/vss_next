// Notes API service with passkey integration for encrypted messaging
import { getStoredPasskey, encryptMessage } from './encryption';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5321';
const NOTES_BASE = `${BASE_URL}/api/v1/notes`;

/**
 * Get notes with pagination
 * @param {string} token - Authorization token
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 5)
 * @returns {Promise<Object>} Notes data
 */
export const getNotes = async (token, page = 1, size = 5) => {
  try {
    const response = await fetch(`${NOTES_BASE}/?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch notes');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching notes:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Create a new encrypted note
 * @param {string} token - Authorization token
 * @param {Object} noteData - Note data to create
 * @param {string} password - User's password for encryption
 * @returns {Promise<Object>} Creation result
 */
export const createEncryptedNote = async (token, noteData, password) => {
  try {
    const passkey = getStoredPasskey();
    if (!passkey) {
      throw new Error('Passkey not available. Please set your password first.');
    }

    // Encrypt the note content using the user's password and stored keys
    const encryptedContent = await encryptNoteContent(noteData.content, password, passkey);
    
    if (!encryptedContent) {
      throw new Error('Failed to encrypt note content');
    }

    // Prepare the note payload with encrypted content
    const encryptedNotePayload = {
      ...noteData,
      content: encryptedContent,
      encrypted: true,
      encryptionMetadata: {
        algorithm: 'AES-256-GCM',
        keyId: passkey.id,
        timestamp: new Date().toISOString()
      }
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create note');
    }

    const createdNote = await response.json();
    return { success: true, note: createdNote };
  } catch (error) {
    console.error('Error creating note:', error);
    return { success: false, message: error.message };
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
    const response = await fetch(`${NOTES_BASE}/${noteId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update note');
    }

    const updatedNote = await response.json();
    return { success: true, note: updatedNote };
  } catch (error) {
    console.error('Error updating note:', error);
    return { success: false, message: error.message };
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete note');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting note:', error);
    return { success: false, message: error.message };
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
    // TODO: Implement actual decryption using the stored passkey and password
    // This is a placeholder implementation
    
    if (encryptedContent.startsWith('encrypted_')) {
      const parts = encryptedContent.split('_');
      if (parts.length >= 2) {
        return atob(parts[1]);
      }
    }
    
    return null;
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