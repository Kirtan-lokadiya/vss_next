import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  initDB,
  checkPasswordHashExists,
  storePasswordHash,
  verifyPassword,
  getAllNotes,
  storeNote,
  updateNote,
  generateNegativeId,
  searchNotes
} from '../utils/indexedDB';
import {
  setPasskey,
  loadAllNotes,
  searchNoteById
} from '../utils/whiteboardApi';
import { startSyncManager, stopSyncManager, forceSync } from '../utils/syncManager';

const WhiteboardContext = createContext({
  // State
  notes: [],
  isPasswordSet: false,
  isUnlocked: false,
  loading: false,
  error: null,
  syncStatus: 'idle', // 'idle', 'syncing', 'error'

  // Actions
  setupPasskey: async () => { },
  unlockWhiteboard: async () => { },
  createNote: async () => { },
  updateNoteContent: async () => { },
  updateNotePosition: async () => { },
  deleteNote: async () => { },
  searchNotes: async () => { },
  forceSync: async () => { },
  reset: () => { },
});

export const WhiteboardProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const { token } = useAuth();

  // Initialize IndexedDB and check for existing password hash on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        await initDB();

        // Check if password hash already exists
        const hashCheckResult = await checkPasswordHashExists();
        if (hashCheckResult.success && hashCheckResult.exists) {
          setIsPasswordSet(true);
        }
      } catch (error) {
        console.error('Error initializing whiteboard:', error);
      }
    };

    initialize();
  }, []);

  // Setup sync manager callbacks
  const syncCallbacks = {
    onSyncStart: () => setSyncStatus('syncing'),
    onSyncComplete: async (count) => {
      setSyncStatus('idle');
      console.log(`Synced ${count} notes`);
      try {
        const { notes: updatedNotes } = await getAllNotes();
        setNotes(updatedNotes || []);
      } catch (e) {
        console.error('Failed to refresh notes after sync:', e);
      }
    },
    onSyncError: (error) => {
      setSyncStatus('error');
      console.error('Sync error:', error);
    },
  };

  // Start/stop sync manager based on unlock status
  useEffect(() => {
    if (isUnlocked && token) {
      startSyncManager(token, syncCallbacks);
    } else {
      stopSyncManager();
    }

    return () => {
      stopSyncManager();
    };
  }, [isUnlocked, token]);

  /**
   * Setup passkey with custom password
   */
  const setupPasskey = useCallback(async (password) => {
    if (!token) {
      return { success: false, message: 'No authentication token available' };
    }
  
    setLoading(true);
    setError(null);
  
    try {
      // 1. First check local IndexedDB
      const hashCheckResult = await checkPasswordHashExists();
      if (hashCheckResult.success && hashCheckResult.exists) {
        const verifyResult = await verifyPassword(password);
        if (verifyResult.success && verifyResult.valid) {
          setIsPasswordSet(true);
          return { success: true, alreadySet: true, message: 'Password verified locally' };
        } else {
          return { success: false, message: 'Password verification failed - incorrect password' };
        }
      }
  
      // 2. If no local hash → check backend
      const verifyWithBackend = await loadAllNotes(token, password);
      if (verifyWithBackend.success) {
        const storeResult = await storePasswordHash(password);
        if (!storeResult.success) {
          return { success: false, message: 'Failed to store password hash locally' };
        }
        setIsPasswordSet(true);
        return {
          success: true,
          alreadySet: true,
          message: 'Passkey already set on server, verified successfully'
        };
      } else if (verifyWithBackend.wrongPassword) {
        return { success: false, message: 'Incorrect password' };
      }
  
      // 3. If backend also doesn’t have passkey → first-time setup
      const result = await setPasskey(token, password);
      if (!result.success && !result.alreadySet) {
        return { success: false, message: result.error || 'Failed to setup passkey' };
      }
  
      const hashResult = await storePasswordHash(password);
      if (!hashResult.success) {
        return { success: false, message: 'Failed to store password hash locally' };
      }
  
      setIsPasswordSet(true);
      return {
        success: true,
        alreadySet: result.alreadySet || false,
        message: result.alreadySet ? 'Passkey already set' : 'Passkey setup successful'
      };
  
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, [token]);
  

  /**
   * Unlock whiteboard with custom password
   */
  const unlockWhiteboard = useCallback(async (password) => {
    if (!token) {
      return { success: false, message: 'No authentication token available' };
    }

    setLoading(true);
    setError(null);

    try {
      // Verify password against stored hash
      const verifyResult = await verifyPassword(password);
      if (!verifyResult.success || !verifyResult.valid) {
        return { success: false, message: 'Invalid password, try again' }; // ✅ no throw
      }

      // Load all notes from API
      const notesResult = await loadAllNotes(token, password);
      if (!notesResult.success) {
        if (notesResult.wrongPassword) {
          return { success: false, message: 'Wrong password' };
        }
        return { success: false, message: notesResult.error || 'Failed to load notes' };
      }

      // Store notes in IndexedDB and update state
      const apiNotes = notesResult.notes || [];
      const formattedNotes = [];

      for (const apiNote of apiNotes) {
        const note = {
          noteId: apiNote.noteId || apiNote.id,
          content: apiNote.content || '',
          properties: apiNote.properties || {
            x: 100,
            y: 100,
            z: 1,
            color: '#ffffff',
            height: 100,
            width: 200,
            empty: false
          },
          sendNoteId: apiNote.noteId || apiNote.id,
          realNoteId: apiNote.noteId || apiNote.id,
          modifyFlag: 0
        };

        await storeNote(note);
        formattedNotes.push(note);
      }

      setNotes(formattedNotes);
      setIsUnlocked(true);
      setIsPasswordSet(true);

      return { success: true };
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [token]);

  /**
   * Create a new note
   */
  const createNote = useCallback(async (content = "New note", position = null) => {
    if (!isUnlocked) {
      return { success: false, message: 'Whiteboard is locked' };
    }

    try {
      const negativeId = await generateNegativeId();

      // Calculate responsive grid position
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
      const NOTE_W = 256;
      const NOTE_H = 192;
      const GAP = 24;
      const usableWidth = Math.max(320, viewportWidth - GAP * 2);
      const perRow = Math.max(1, Math.floor(usableWidth / (NOTE_W + GAP)));
      const idx = notes.length;
      const col = idx % perRow;
      const row = Math.floor(idx / perRow);

      const notePosition = position || {
        x: GAP + col * (NOTE_W + GAP),
        y: GAP + row * (NOTE_H + GAP)
      };

      const newNote = {
        noteId: negativeId,
        content,
        properties: {
          x: notePosition.x,
          y: notePosition.y,
          z: Date.now() % 1000, // Simple z-index
          color: '#FFFFFF',
          height: 140,
          width: 240,
          empty: false
        },
        sendNoteId: negativeId,
        realNoteId: null,
        modifyFlag: 1
      };

      // Store in IndexedDB
      await storeNote(newNote);

      // Update state
      setNotes(prev => [...prev, newNote]);

      return { success: true, note: newNote };
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }, [isUnlocked, notes.length]);

  /**
   * Update note content
   */
  const updateNoteContent = useCallback(async (noteId, content) => {
    if (!isUnlocked) {
      return { success: false, message: 'Whiteboard is locked' };
    }

    try {
      // Update in IndexedDB
      const result = await updateNote(noteId, { content });
      if (!result.success) {
        return { success: false, message: 'Failed to update note in IndexedDB' };
      }

      // Update state
      setNotes(prev => prev.map(note =>
        note.noteId === noteId
          ? { ...note, content, modifyFlag: 1 }
          : note
      ));

      return { success: true };
    } catch (error) {
      console.error('Error updating note content:', error);
      return { success: false, message: error.message };
    }
  }, [isUnlocked]);

  /**
   * Update note position/properties
   */
  const updateNotePosition = useCallback(async (noteId, properties) => {
    if (!isUnlocked) {
      return { success: false, message: 'Whiteboard is locked' };
    }

    try {
      // Update in IndexedDB
      const result = await updateNote(noteId, { properties });
      if (!result.success) {
        return { success: false, message: 'Failed to update note properties in IndexedDB' };
      }

      // Update state
      setNotes(prev => prev.map(note =>
        note.noteId === noteId
          ? { ...note, properties, modifyFlag: 1 }
          : note
      ));

      return { success: true };
    } catch (error) {
      console.error('Error updating note position:', error);
      return { success: false, message: error.message };
    }
  }, [isUnlocked]);

  /**
   * Search notes
   */
  const searchNotesLocal = useCallback(async (query) => {
    if (!isUnlocked) {
      return { success: false, message: 'Whiteboard is locked' };
    }

    try {
      const result = await searchNotes(query);
      return result;
    } catch (error) {
      console.error('Error searching notes:', error);
      return { success: false, message: error.message };
    }
  }, [isUnlocked]);

  /**
   * Search note by ID (for global search)
   */
  const searchNoteByIdRemote = useCallback(async (noteId) => {
    if (!token) {
      return { success: false, message: 'No authentication token available' };
    }

    try {
      // If negative ID, sync first to get real ID
      let realNoteId = noteId;
      if (noteId < 0) {
        await forceSync();
        // Get updated note from IndexedDB
        const { notes: updatedNotes } = await getAllNotes();
        const updatedNote = updatedNotes.find(n => n.sendNoteId === noteId);
        if (updatedNote && updatedNote.realNoteId > 0) {
          realNoteId = updatedNote.realNoteId;
        }
      }

      const result = await searchNoteById(token, realNoteId);
      return result;
    } catch (error) {
      console.error('Error searching note by ID:', error);
      return { success: false, message: error.message };
    }
  }, [token]);

  /**
   * Force sync
   */
  const forceSyncNow = useCallback(async () => {
    if (!isUnlocked) {
      return { success: false, message: 'Whiteboard is locked' };
    }

    try {
      await forceSync();

      // Reload notes from IndexedDB to get updated IDs
      const { notes: updatedNotes } = await getAllNotes();
      setNotes(updatedNotes || []);

      return { success: true };
    } catch (error) {
      console.error('Error forcing sync:', error);
      return { success: false, message: error.message };
    }
  }, [isUnlocked]);

  /**
   * Reset whiteboard state
   */
  const reset = useCallback(() => {
    setNotes([]);
    setIsPasswordSet(false);
    setIsUnlocked(false);
    setError(null);
    setSyncStatus('idle');
    stopSyncManager();
  }, []);

  const value = {
    // State
    notes,
    isPasswordSet,
    isUnlocked,
    loading,
    error,
    syncStatus,

    // Actions
    setupPasskey,
    unlockWhiteboard,
    createNote,
    updateNoteContent,
    updateNotePosition,
    searchNotes: searchNotesLocal,
    searchNoteById: searchNoteByIdRemote,
    forceSync: forceSyncNow,
    reset,
  };

  return (
    <WhiteboardContext.Provider value={value}>
      {children}
    </WhiteboardContext.Provider>
  );
};

export const useWhiteboard = () => {
  const context = useContext(WhiteboardContext);
  if (!context) {
    throw new Error('useWhiteboard must be used within a WhiteboardProvider');
  }
  return context;
};