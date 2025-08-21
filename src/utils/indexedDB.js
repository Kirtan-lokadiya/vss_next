/**
 * IndexedDB utilities for managing notes, password hash, and offline data
 */

const DB_NAME = 'WhiteboardDB';
const DB_VERSION = 1;
const NOTES_STORE = 'notes';
const CONFIG_STORE = 'config';

// Initialize IndexedDB
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create notes store
      if (!db.objectStoreNames.contains(NOTES_STORE)) {
        const notesStore = db.createObjectStore(NOTES_STORE, { keyPath: 'noteId' });
        notesStore.createIndex('modifyFlag', 'modifyFlag', { unique: false });
        notesStore.createIndex('sendNoteId', 'sendNoteId', { unique: false });
      }
      
      // Create config store for password hash and other settings
      if (!db.objectStoreNames.contains(CONFIG_STORE)) {
        db.createObjectStore(CONFIG_STORE, { keyPath: 'key' });
      }
    };
  });
};

// Hash password using Web Crypto API
export const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Store password hash in IndexedDB
export const storePasswordHash = async (password) => {
  try {
    const db = await initDB();
    const hashedPassword = await hashPassword(password);
    
    const transaction = db.transaction([CONFIG_STORE], 'readwrite');
    const store = transaction.objectStore(CONFIG_STORE);
    
    await store.put({ key: 'passwordHash', value: hashedPassword });
    
    return { success: true };
  } catch (error) {
    console.error('Error storing password hash:', error);
    return { success: false, error: error.message };
  }
};

// Verify password against stored hash
export const verifyPassword = async (password) => {
  try {
    const db = await initDB();
    const hashedPassword = await hashPassword(password);
    
    const transaction = db.transaction([CONFIG_STORE], 'readonly');
    const store = transaction.objectStore(CONFIG_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.get('passwordHash');
      
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.value === hashedPassword) {
          resolve({ success: true, valid: true });
        } else {
          resolve({ success: true, valid: false });
        }
      };
      
      request.onerror = () => {
        reject({ success: false, error: request.error });
      };
    });
  } catch (error) {
    console.error('Error verifying password:', error);
    return { success: false, error: error.message };
  }
};

// Get all notes from IndexedDB
export const getAllNotes = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([NOTES_STORE], 'readonly');
    const store = transaction.objectStore(NOTES_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve({ success: true, notes: request.result });
      };
      
      request.onerror = () => {
        reject({ success: false, error: request.error });
      };
    });
  } catch (error) {
    console.error('Error getting all notes:', error);
    return { success: false, error: error.message };
  }
};

// Store note in IndexedDB
export const storeNote = async (note) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([NOTES_STORE], 'readwrite');
    const store = transaction.objectStore(NOTES_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.put(note);
      
      request.onsuccess = () => {
        resolve({ success: true });
      };
      
      request.onerror = () => {
        reject({ success: false, error: request.error });
      };
    });
  } catch (error) {
    console.error('Error storing note:', error);
    return { success: false, error: error.message };
  }
};

// Update note in IndexedDB
export const updateNote = async (noteId, updates) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([NOTES_STORE], 'readwrite');
    const store = transaction.objectStore(NOTES_STORE);
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(noteId);
      
      getRequest.onsuccess = () => {
        const existingNote = getRequest.result;
        if (existingNote) {
          const updatedNote = { 
            ...existingNote, 
            ...updates, 
            modifyFlag: true 
          };
          
          const putRequest = store.put(updatedNote);
          
          putRequest.onsuccess = () => {
            resolve({ success: true, note: updatedNote });
          };
          
          putRequest.onerror = () => {
            reject({ success: false, error: putRequest.error });
          };
        } else {
          reject({ success: false, error: 'Note not found' });
        }
      };
      
      getRequest.onerror = () => {
        reject({ success: false, error: getRequest.error });
      };
    });
  } catch (error) {
    console.error('Error updating note:', error);
    return { success: false, error: error.message };
  }
};

// Get notes with modifyFlag = true
export const getModifiedNotes = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([NOTES_STORE], 'readonly');
    const store = transaction.objectStore(NOTES_STORE);
    const index = store.index('modifyFlag');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(true);
      
      request.onsuccess = () => {
        resolve({ success: true, notes: request.result });
      };
      
      request.onerror = () => {
        reject({ success: false, error: request.error });
      };
    });
  } catch (error) {
    console.error('Error getting modified notes:', error);
    return { success: false, error: error.message };
  }
};

// Update note with real noteId after sync
export const updateNoteWithRealId = async (sendNoteId, realNoteId) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([NOTES_STORE], 'readwrite');
    const store = transaction.objectStore(NOTES_STORE);
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(sendNoteId);
      
      getRequest.onsuccess = () => {
        const note = getRequest.result;
        if (note) {
          // Delete old record
          const deleteRequest = store.delete(sendNoteId);
          
          deleteRequest.onsuccess = () => {
            // Create new record with real ID
            const updatedNote = {
              ...note,
              noteId: realNoteId,
              sendNoteId: realNoteId,
              realNoteId: realNoteId,
              modifyFlag: false
            };
            
            const putRequest = store.put(updatedNote);
            
            putRequest.onsuccess = () => {
              resolve({ success: true, note: updatedNote });
            };
            
            putRequest.onerror = () => {
              reject({ success: false, error: putRequest.error });
            };
          };
          
          deleteRequest.onerror = () => {
            reject({ success: false, error: deleteRequest.error });
          };
        } else {
          reject({ success: false, error: 'Note not found' });
        }
      };
      
      getRequest.onerror = () => {
        reject({ success: false, error: getRequest.error });
      };
    });
  } catch (error) {
    console.error('Error updating note with real ID:', error);
    return { success: false, error: error.message };
  }
};

// Delete note from IndexedDB
export const deleteNote = async (noteId) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([NOTES_STORE], 'readwrite');
    const store = transaction.objectStore(NOTES_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(noteId);
      
      request.onsuccess = () => {
        resolve({ success: true });
      };
      
      request.onerror = () => {
        reject({ success: false, error: request.error });
      };
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    return { success: false, error: error.message };
  }
};

// Clear all notes from IndexedDB
export const clearAllNotes = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([NOTES_STORE], 'readwrite');
    const store = transaction.objectStore(NOTES_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      
      request.onsuccess = () => {
        resolve({ success: true });
      };
      
      request.onerror = () => {
        reject({ success: false, error: request.error });
      };
    });
  } catch (error) {
    console.error('Error clearing all notes:', error);
    return { success: false, error: error.message };
  }
};

// Generate negative ID for new notes
export const generateNegativeId = async () => {
  try {
    const { notes } = await getAllNotes();
    if (!notes || notes.length === 0) {
      return -1;
    }
    
    // Find the lowest negative ID and decrement
    const negativeIds = notes
      .map(note => note.noteId)
      .filter(id => id < 0)
      .sort((a, b) => a - b);
    
    if (negativeIds.length === 0) {
      return -1;
    }
    
    return negativeIds[0] - 1;
  } catch (error) {
    console.error('Error generating negative ID:', error);
    return -1;
  }
};

// Search notes by content
export const searchNotes = async (query) => {
  try {
    const { notes } = await getAllNotes();
    if (!notes) return { success: true, notes: [] };
    
    const filteredNotes = notes.filter(note => 
      note.content.toLowerCase().includes(query.toLowerCase())
    );
    
    return { success: true, notes: filteredNotes };
  } catch (error) {
    console.error('Error searching notes:', error);
    return { success: false, error: error.message };
  }
};