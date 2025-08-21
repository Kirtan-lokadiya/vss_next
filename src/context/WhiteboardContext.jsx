import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  initDB, 
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
  setupPasskey: async () => {},
  unlockWhiteboard: async () => {},
  createNote: async () => {},
  updateNoteContent: async () => {},
  updateNotePosition: async () => {},
  deleteNote: async () => {},
  searchNotes: async () => {},
  forceSync: async () => {},
  reset: () => {},
});

export const WhiteboardProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const { token } = useAuth();

  // Initialize IndexedDB on mount
  useEffect(() => {
    initDB().catch(console.error);
  }, []);

  // Setup sync manager callbacks
  const syncCallbacks = {
    onSyncStart: () => setSyncStatus('syncing'),
    onSyncComplete: (count) => {
      setSyncStatus('idle');
      console.log(`Synced ${count} notes`);
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
   * Setup passkey with password 7510
   */
  const setupPasskey = useCallback(async (password) => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    setLoading(true);
    setError(null);

    try {
      // Call API to set passkey
      const result = await setPasskey(token, password);
      console.log(result);

      if (!result.success && !result.alreadySet) {
        throw new Error(result.error || 'Failed to setup passkey');
      }

      // Store hashed password in IndexedDB
      const hashResult = await storePasswordHash(password);
      if (!hashResult.success) {
        throw new Error('Failed to store password hash');
      }

      setIsPasswordSet(true);
      
      return {
        success: true,
        alreadySet: result.alreadySet || false,
        message: result.alreadySet ? 'Passkey already set' : 'Passkey setup successful'
      };
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [token]);

  /**
   * Unlock whiteboard with password
   */
  const unlockWhiteboard = useCallback(async (password = "7510") => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    setLoading(true);
    setError(null);

    try {
      // Verify password against stored hash
      const verifyResult = await verifyPassword(password);
      if (!verifyResult.success || !verifyResult.valid) {
        throw new Error('Invalid password');
      }

      // Load all notes from API
      const notesResult = await loadAllNotes(token, password);
      if (!notesResult.success) {
        if (notesResult.wrongPassword) {
          throw new Error('Wrong password');
        }
        throw new Error(notesResult.error || 'Failed to load notes');
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
          modifyFlag: false
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
      throw new Error('Whiteboard is locked');
    }

    try {
      const negativeId = await generateNegativeId();
      const notePosition = position || {
        x: Math.random() * 500 + 100,
        y: Math.random() * 300 + 100
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
        modifyFlag: true
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
  }, [isUnlocked]);

  /**
   * Update note content
   */
  const updateNoteContent = useCallback(async (noteId, content) => {
    if (!isUnlocked) {
      throw new Error('Whiteboard is locked');
    }

    try {
      // Update in IndexedDB
      const result = await updateNote(noteId, { content });
      if (!result.success) {
        throw new Error('Failed to update note in IndexedDB');
      }

      // Update state
      setNotes(prev => prev.map(note => 
        note.noteId === noteId 
          ? { ...note, content, modifyFlag: true }
          : note
      ));

      return { success: true };
    } catch (error) {
      console.error('Error updating note content:', error);
      throw error;
    }
  }, [isUnlocked]);

  /**
   * Update note position/properties
   */
  const updateNotePosition = useCallback(async (noteId, properties) => {
    if (!isUnlocked) {
      throw new Error('Whiteboard is locked');
    }

    try {
      // Update in IndexedDB
      const result = await updateNote(noteId, { properties });
      if (!result.success) {
        throw new Error('Failed to update note properties in IndexedDB');
      }

      // Update state
      setNotes(prev => prev.map(note => 
        note.noteId === noteId 
          ? { ...note, properties, modifyFlag: true }
          : note
      ));

      return { success: true };
    } catch (error) {
      console.error('Error updating note position:', error);
      throw error;
    }
  }, [isUnlocked]);

  /**
   * Delete note
   */
  const deleteNote = useCallback(async (noteId) => {
    if (!isUnlocked) {
      throw new Error('Whiteboard is locked');
    }

    try {
      // For negative IDs, just remove from IndexedDB
      if (noteId < 0) {
        await updateNote(noteId, { isDeleted: true, modifyFlag: true });
      } else {
        // For positive IDs, mark as deleted and sync will handle it
        await updateNote(noteId, { isDeleted: true, modifyFlag: true });
      }

      // Update state
      setNotes(prev => prev.filter(note => note.noteId !== noteId));

      return { success: true };
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }, [isUnlocked]);

  /**
   * Search notes
   */
  const searchNotesLocal = useCallback(async (query) => {
    if (!isUnlocked) {
      throw new Error('Whiteboard is locked');
    }

    try {
      const result = await searchNotes(query);
      return result;
    } catch (error) {
      console.error('Error searching notes:', error);
      throw error;
    }
  }, [isUnlocked]);

  /**
   * Search note by ID (for global search)
   */
  const searchNoteByIdRemote = useCallback(async (noteId) => {
    if (!token) {
      throw new Error('No authentication token available');
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
      throw error;
    }
  }, [token]);

  /**
   * Force sync
   */
  const forceSyncNow = useCallback(async () => {
    if (!isUnlocked) {
      throw new Error('Whiteboard is locked');
    }

    try {
      await forceSync();
      
      // Reload notes from IndexedDB to get updated IDs
      const { notes: updatedNotes } = await getAllNotes();
      setNotes(updatedNotes || []);
      
      return { success: true };
    } catch (error) {
      console.error('Error forcing sync:', error);
      throw error;
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
    deleteNote,
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