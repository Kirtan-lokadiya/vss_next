// Notes API service for plain content notes
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5321';
const NOTES_BASE = `${BASE_URL}/api/v1/notes`;

// Fallback: read token from localStorage if not provided
const getStoredToken = () => {
  try { return typeof window !== 'undefined' ? localStorage.getItem('token') : null; } catch { return null; }
};

/**
 * Get notes with pagination
 * @param {string} token - Authorization token
 * @param {number} page - Page number (default: 1)
 * @param {number} size - Page size (default: 10)
 * @param {string} password - User's notes password (required)
 * @returns {Promise<Object>} Notes data
 */
export async function getNotes(token, page = 1, size = 10, password = '') {
  try {
    const url = `${NOTES_BASE}/?page=${page}&size=${size}${password ? `&password=${encodeURIComponent(password)}` : ''}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    
    // Handle "Page is empty" as success (user has no notes yet)
    if (data?.errors?.message === 'Page is empty' && data?.customCode === 404) {
      return {
        success: true,
        data: [], // Empty notes list
      };
    }
    
    // Treat other 200 with errors as failure (backend convention)
    if (data?.errors) {
      return { success: false, error: data.errors.message || 'Failed to load notes', api: data };
    }
    
    return {
      success: true,
      data: data.notes || [],
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

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

/**
 * Create a new note with plain content
 * @param {string} token - Authorization token
 * @param {Object} noteData - Note data to create
 * @returns {Promise<Object>} Creation result
 */
export const createNote = async (token, noteData) => {
  try {
    // Prepare the note payload with plain content
    const notePayload = {
      userId: noteData.userId || getUserIdFromToken(token),
      content: noteData.content || 'New note',
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
      body: JSON.stringify(notePayload),
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
 * @param {string} token - Authorization token (optional, will fallback to localStorage)
 * @param {string} noteId - Note ID to update
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Update result
 */
export const updateNote = async (token, noteId, updateData) => {
  try {
    const effectiveToken = token || getStoredToken();
    const response = await fetch(`${NOTES_BASE}/properties/${noteId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${effectiveToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      // Some endpoints return empty body on error; guard JSON parse
      let message = 'Failed to update note';
      try {
        const errJson = await response.json();
        if (errJson?.message) message = errJson.message;
        // Surface unauthorized clearly
        if (response.status === 401) message = 'Unauthorized (missing or invalid token)';
      } catch {
        const errText = await response.text().catch(() => '');
        if (errText) message = errText;
      }
      throw new Error(message);
    }

    // Backend may return true/empty body; handle gracefully
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