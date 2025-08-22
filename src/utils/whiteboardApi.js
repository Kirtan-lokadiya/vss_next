/**
 * Whiteboard API utilities for the new ideas page logic
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5321';
const SECURITY_BASE = `${BASE_URL}/api/v1/network-security`;
const NOTES_BASE = `${BASE_URL}/api/v1/notes`;

// Get token from localStorage
const getStoredToken = () => {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  } catch {
    return null;
  }
};

/**
 * Set passkey with password 7510
 * @param {string} token - Authorization token
 * @param {string} password - Password (should be "7510")
 * @returns {Promise<Object>} API response
 */
export const setPasskey = async (token, password ) => {
  try {
    const url = `${SECURITY_BASE}/passkeys?password=${encodeURIComponent(password)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: password }),
    });

    const data = await response.json();

    // Check if passkey is already set
    if (data.errors && data.errors.message === "Already Set Security Key" && data.customCode === 403) {
      return {
        success: true,
        alreadySet: true,
        message: "Passkey already set",
        data
      };
    }

    // Success response with passkey data
    if (response.ok && data.id && data.publicKey) {
      return {
        success: true,
        alreadySet: false,
        data
      };
    }

    // Error response
    return {
      success: false,
      error: data.errors?.message || 'Failed to set passkey',
      data
    };
  } catch (error) {
    console.error('Error setting passkey:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get notes with pagination and password
 * @param {string} token - Authorization token
 * @param {number} page - Page number
 * @param {number} size - Page size
 * @param {string} password - Password for decryption
 * @returns {Promise<Object>} Notes data
 */
export const getNotesPage = async (token, page = 1, size = 5, password = "7510") => {
  try {
    const url = `${NOTES_BASE}/?page=${page}&size=${size}&password=${encodeURIComponent(password)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    // Check for empty page (end of pagination)
    if (data.errors && data.errors.message === "Page is empty" && data.customCode === 404) {
      return {
        success: true,
        isEmpty: true,
        notes: [],
        data
      };
    }

    // Check for wrong password
    if (data.errors && data.errors.message === "Error Will Decrypt Content" && data.customCode === 1001) {
      return {
        success: false,
        wrongPassword: true,
        error: "Wrong password",
        data
      };
    }

    // Success with notes
    if (response.ok && data.notes) {
      return {
        success: true,
        isEmpty: false,
        notes: data.notes,
        data
      };
    }

    // Other error
    return {
      success: false,
      error: data.errors?.message || 'Failed to get notes',
      data
    };
  } catch (error) {
    console.error('Error getting notes page:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Load all notes by paginating through all pages
 * @param {string} token - Authorization token
 * @param {string} password - Password for decryption
 * @returns {Promise<Object>} All notes data
 */
export const loadAllNotes = async (token, password ) => {
  try {
    const allNotes = [];
    let page = 1;
    const size = 5;
    let hasMore = true;

    while (hasMore) {
      const result = await getNotesPage(token, page, size, password);
      
      if (!result.success) {
        return result; // Return error immediately
      }

      if (result.isEmpty) {
        hasMore = false; // End of pagination
      } else {
        allNotes.push(...result.notes);
        page++;
      }
    }

    return {
      success: true,
      notes: allNotes,
      totalPages: page - 1
    };
  } catch (error) {
    console.error('Error loading all notes:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Sync notes to server
 * @param {string} token - Authorization token
 * @param {Array} notes - Array of notes to sync
 * @returns {Promise<Object>} Sync result
 */
export const syncNotes = async (token, notes) => {
  try {
    const url = `${NOTES_BASE}/user-notes`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // API expects payload in the shape { notes: [...] }
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to sync notes');
    }

    const data = await response.json();
    
    // Expected response format:
    // [{ "sendNoteId": -1, "realNoteId": 452, "modifyFlag": 0 }, ...]
    return {
      success: true,
      syncResults: data
    };
  } catch (error) {
    console.error('Error syncing notes:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Search notes by noteId
 * @param {string} token - Authorization token
 * @param {number} noteId - Note ID to search
 * @returns {Promise<Object>} Search result
 */
export const searchNoteById = async (token, noteId) => {
  try {
    const url = `${NOTES_BASE}/search?noteId=${noteId}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to search note');
    }

    const data = await response.json();
    
    return {
      success: true,
      users: data.users || []
    };
  } catch (error) {
    console.error('Error searching note by ID:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Create a new note
 * @param {string} token - Authorization token
 * @param {Object} noteData - Note data
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

    const data = await response.json();
    return {
      success: true,
      note: data
    };
  } catch (error) {
    console.error('Error creating note:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update note content
 * @param {string} token - Authorization token
 * @param {number} noteId - Note ID
 * @param {Object} updates - Content updates
 * @returns {Promise<Object>} Update result
 */
export const updateNoteContent = async (token, noteId, updates) => {
  try {
    const response = await fetch(`${NOTES_BASE}/content/${noteId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ noteId, ...updates }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update note content');
    }

    const data = await response.json();
    return {
      success: true,
      note: data
    };
  } catch (error) {
    console.error('Error updating note content:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update note properties
 * @param {string} token - Authorization token
 * @param {number} noteId - Note ID
 * @param {Object} properties - Properties to update
 * @returns {Promise<Object>} Update result
 */
export const updateNoteProperties = async (token, noteId, properties) => {
  try {
    const response = await fetch(`${NOTES_BASE}/properties/${noteId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ noteId, ...properties }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update note properties');
    }

    const data = await response.json();
    return {
      success: true,
      note: data
    };
  } catch (error) {
    console.error('Error updating note properties:', error);
    return {
      success: false,
      error: error.message
    };
  }
};