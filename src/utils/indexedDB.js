/**
 * IndexedDB utilities for managing notes, password hash, and offline data
 */
const DB_NAME = 'WhiteboardDB';
const DB_VERSION = 3; // 🔼 bump version to trigger migration
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

      // ----- Notes Store -----
      let notesStore;
      if (!db.objectStoreNames.contains(NOTES_STORE)) {
        // Create notes store if not exists
        notesStore = db.createObjectStore(NOTES_STORE, { keyPath: 'noteId' });
      } else {
        // Get existing store
        notesStore = event.target.transaction.objectStore(NOTES_STORE);

        // ✅ Remove old indexes if they exist
        if (notesStore.indexNames.contains('modifyFlag')) {
          notesStore.deleteIndex('modifyFlag');
        }
        if (notesStore.indexNames.contains('sendNoteId')) {
          notesStore.deleteIndex('sendNoteId');
        }
      }

      // ✅ Ensure new index exists
      if (!notesStore.indexNames.contains('isDirty')) {
        notesStore.createIndex('isDirty', 'isDirty', { unique: false });
      }

      // ----- Config Store -----
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

// Check if password hash exists in IndexedDB
export const checkPasswordHashExists = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([CONFIG_STORE], 'readonly');
    const store = transaction.objectStore(CONFIG_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.get('passwordHash');
      
      request.onsuccess = () => {
        const result = request.result;
        resolve({ 
          success: true, 
          exists: result ? true : false,
          hash: result ? result.value : null
        });
      };
      
      request.onerror = () => {
        reject({ success: false, error: request.error });
      };
    });
  } catch (error) {
    console.error('Error checking password hash:', error);
    return { success: false, error: error.message };
  }
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
export const verifyPassword = async (password, token = null, securityBaseUrl = null) => {
  try {
    const db = await initDB();
    const hashedPassword = await hashPassword(password);

    const transaction = db.transaction([CONFIG_STORE], 'readonly');
    const store = transaction.objectStore(CONFIG_STORE);

    return new Promise((resolve, reject) => {
      const request = store.get('passwordHash');

      request.onsuccess = async () => {
        const result = request.result;

        if (result && result.value) {
          // ✅ Local hash check
          if (result.value === hashedPassword) {
            resolve({ success: true, valid: true, source: "local" });
          } else {
            resolve({ success: true, valid: false, source: "local" });
          }
          return;
        }

        // No local hash -> fallback to backend check
        try {
          const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5321';
          const securityUrl = `${BASE_URL}/api/v1/network-security`;
          console.log("token1",token);
          const res = await fetch(`${securityUrl}/passkeys?password=${encodeURIComponent(password)}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              // include Authorization header only if token provided
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },

          });

          let data;
          try {
            data = await res.json();
          } catch (e) {
            data = null;
          }
        console.log("data1",data);
          // If backend returns an object with publicKey -> valid password on server
          if (res.ok && data && data.publicKey) {
            // store local hash for offline checks going forward
            await storePasswordHash(password);
            resolve({ success: true, valid: true, source: "backend" });
            return;
          }

          // Special case: backend returns 200 but has errors.message "Already Set Security Key"
          const errMsg = data?.errors?.message || "";
          if (errMsg.includes("Password is Not correct")) {
            // This indicates: server has a passkey already (user must unlock), but password provided is not usable to create new passkey.
            resolve({ success: true, valid: false, source: "backend", serverAlreadySet: true });
            return;
          }

            // Default fallback: treat as invalid password (backend didn't confirm)
          resolve({ success: true, valid: false, source: "backend" });
        } catch (err) {
          console.error("Backend password verify failed:", err);
          resolve({ success: false, error: err.message, source: "backend" });
        }
      };

      request.onerror = () => {
        reject({ success: false, error: request.error });
      };
    });
  } catch (error) {
    console.error("Error verifying password:", error);
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
          const updatedNote = { ...existingNote };
          let hasChanges = false;

          // Apply content update
          if (Object.prototype.hasOwnProperty.call(updates || {}, 'content')) {
            updatedNote.content = updates.content;
            hasChanges = true;
          }

          // Apply properties update (merge)
          if (updates && typeof updates.properties === 'object' && updates.properties !== null) {
            updatedNote.properties = { ...(existingNote.properties || {}), ...updates.properties };
            hasChanges = true;
          }

          // Mark as dirty if there are changes
          if (hasChanges) {
            updatedNote.isDirty = true;
          }

          // Allow explicit isDirty override
          if (Object.prototype.hasOwnProperty.call(updates || {}, 'isDirty')) {
            updatedNote.isDirty = updates.isDirty;
          }
          
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

// Get notes with isDirty = true
export const getModifiedNotes = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([NOTES_STORE], 'readonly');
    const store = transaction.objectStore(NOTES_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        const allNotes = request.result || [];
        const dirtyNotes = allNotes.filter(note => note.isDirty === true);
        resolve({ success: true, notes: dirtyNotes });
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
              isDirty: false
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
    
    // Find the lowest negative ID and decrement means every time reeset to 1 if i am not wrong
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

// Mark a note as synced
export const markNoteSynced = async (noteId) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([NOTES_STORE], 'readwrite');
    const store = transaction.objectStore(NOTES_STORE);

    return new Promise((resolve, reject) => {
      const getRequest = store.get(noteId);

      getRequest.onsuccess = () => {
        const note = getRequest.result;
        if (!note) {
          reject({ success: false, error: 'Note not found' });
          return;
        }
        const updated = {
          ...note,
          isDirty: false
        };
        const putRequest = store.put(updated);
        putRequest.onsuccess = () => resolve({ success: true, note: updated });
        putRequest.onerror = () => reject({ success: false, error: putRequest.error });
      };

      getRequest.onerror = () => {
        reject({ success: false, error: getRequest.error });
      };
    });
  } catch (error) {
    console.error('Error marking note as synced:', error);
    return { success: false, error: error.message };
  }
};