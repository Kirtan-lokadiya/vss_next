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
  searchNotes: async () => { },
  searchNoteById: async () => { },
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
  const [passkeyChecked, setPasskeyChecked] = useState(false);
  const [initializing, setInitializing] = useState(true);


  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5321';
  const SECURITY_BASE = `${BASE_URL}/api/v1/network-security`;

useEffect(() => {
  let mounted = true;
  const initialize = async () => {
    setInitializing(true);
    try {
      await initDB();
      // 1. Local check
      const hashCheck = await checkPasswordHashExists();
      if (hashCheck.success && hashCheck.exists) {
        if (!mounted) return;
        setIsPasswordSet(true);
        setPasskeyChecked(true);
        return;
      }

      // 2. If no local hash, check backend (if token available)
      if (token) {
        try {
          const res = await fetch(`${SECURITY_BASE}/passkeys/projection`, {
            headers: { Authorization: `Bearer ${token}` },
          });
            

          if (res.ok) {
            const data = await res.json();
            
            if (data?.encryptedChecksum) {
              if (!mounted) return;
              setIsPasswordSet(true);
            } else {
              if (!mounted) return;
              setIsPasswordSet(false);
            }
          } else {
            // treat error as "not set"
            if (!mounted) return;
            setIsPasswordSet(false);
          }
        } catch (err) {
          console.error('Backend passkey check failed', err);
          if (!mounted) return;
          setIsPasswordSet(false);
        }
      } else {
        if (!mounted) return;
        setIsPasswordSet(false);
      }

    } catch (err) {
      console.error('Init error', err);
      if (!mounted) return;
      setIsPasswordSet(false);
    } finally {
      if (!mounted) return;
      setPasskeyChecked(true);
      setInitializing(false);
    }
  };

  initialize();
  return () => { mounted = false; };
}, [token]);


  // ---------------------------
  // Sync manager lifecycle
  // ---------------------------
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

  useEffect(() => {
    if (isUnlocked && token) {
      startSyncManager(token, syncCallbacks);
    } else {
      stopSyncManager();
    }
    return () => stopSyncManager();
  }, [isUnlocked, token]);

  // ---------------------------
  // Setup Passkey
  // ---------------------------
  const setupPasskey = useCallback(async (password) => {
    if (!token) {
      return { success: false, message: 'No authentication token available' };
    }

    setLoading(true);
    setError(null);

    try {
          // 1. Check local hash first
      const hashCheckResult = await checkPasswordHashExists();
      if (hashCheckResult.success && hashCheckResult.exists) {
        const verifyResult = await verifyPassword(password,token);
        if (verifyResult.success && verifyResult.valid) {
          setIsPasswordSet(true);
          return { success: true, alreadySet: true, message: 'Password verified locally' };
        } else {
          return { success: false, message: 'Password verification failed - incorrect password' };
        }
      }

      // // 2. If no local hash, verify with backend
      // const verifyWithBackend = await loadAllNotes(token, password);
      // if (verifyWithBackend.success) {
      //   const storeResult = await storePasswordHash(password);
      //   if (!storeResult.success) {
      //     return { success: false, message: 'Failed to store password hash locally' };
      //   }
      //   setIsPasswordSet(true);
      //   return {
      //     success: true,
      //     alreadySet: true,
      //     message: 'Passkey already set on server, verified successfully'
      //   };
      // } else if (verifyWithBackend.wrongPassword) {
      //   return { success: false, message: 'Incorrect password' };
      // }

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

  // ---------------------------
  // Unlock Whiteboard
  // ---------------------------
  const unlockWhiteboard = useCallback(async (password) => {
    if (!token) {
      return { success: false, message: 'No authentication token available' };
    }

    setLoading(true);
    setError(null);

    try {
      // console.log("token",token);
      const verifyResult = await verifyPassword(password,token);
      if (!verifyResult.success || !verifyResult.valid) {
        return { success: false, message: 'Invalid password, try again' };
      }

      // 1. Load notes from IndexedDB
      const local = await getAllNotes();
      console.log("local",local)
      const localNotes = (local && local.notes) || [];
      if (localNotes.length > 0) {
        setNotes(localNotes);
        setIsUnlocked(true);
        setIsPasswordSet(true);
        return { success: true, source: 'indexeddb' };
      }

      // 2. If no local notes, load from backend
      const notesResult = await loadAllNotes(token, password);
      
      console.log("noteResult",notesResult)
      if (!notesResult.success) {
        if (notesResult.wrongPassword) {
          return { success: false, message: 'Wrong password' };
        }
        return { success: false, message: notesResult.error || 'Failed to load notes' };
      }

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
          modifyFlag: 0,
          lastSyncedContent: apiNote.content || '',
          lastSyncedProperties: apiNote.properties || {
            x: 100,
            y: 100,
            z: 1,
            color: '#ffffff',
            height: 100,
            width: 200,
            empty: false
          },
          dirty: {}
        };

        await storeNote(note);
        formattedNotes.push(note);
      }

      setNotes(formattedNotes);
      setIsUnlocked(true);
      setIsPasswordSet(true);

      return { success: true, source: 'api' };
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ---------------------------
  // Notes actions
  // ---------------------------
  const createNote = useCallback(async (content = "New note", position = null) => {
    if (!isUnlocked) {
      return { success: false, message: 'Whiteboard is locked' };
    }
    try {
      const negativeId = await generateNegativeId();
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
      const NOTE_W = 256, NOTE_H = 192, GAP = 24;
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
          z: Date.now() % 1000,
          color: '#FFFFFF',
          height: 140,
          width: 240,
          empty: false
        },
        sendNoteId: negativeId,
        realNoteId: null,
        modifyFlag: 1
      };
      await storeNote(newNote);
      setNotes(prev => [...prev, newNote]);
      return { success: true, note: newNote };
    } catch (error) {
      console.error('Error creating note:', error);
      return { success: false, message: error.message };
    }
  }, [isUnlocked, notes.length]);

  const updateNoteContent = useCallback(async (noteId, content) => {
    if (!isUnlocked) {
      return { success: false, message: 'Whiteboard is locked' };
    }
    try {
      const result = await updateNote(noteId, { content });
      if (!result.success) {
        return { success: false, message: 'Failed to update note in IndexedDB' };
      }
      setNotes(prev => prev.map(note =>
        note.noteId === noteId ? { ...note, content, modifyFlag: 1 } : note
      ));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, [isUnlocked]);

  const updateNotePosition = useCallback(async (noteId, properties) => {
    if (!isUnlocked) {
      return { success: false, message: 'Whiteboard is locked' };
    }
    try {
      const result = await updateNote(noteId, { properties });
      if (!result.success) {
        return { success: false, message: 'Failed to update note properties in IndexedDB' };
      }
      setNotes(prev => prev.map(note =>
        note.noteId === noteId ? { ...note, properties, modifyFlag: 1 } : note
      ));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, [isUnlocked]);

  const searchNotesLocal = useCallback(async (query) => {
    if (!isUnlocked) {
      return { success: false, message: 'Whiteboard is locked' };
    }
    try {
      return await searchNotes(query);
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, [isUnlocked]);

  const searchNoteByIdRemote = useCallback(async (noteId) => {
    if (!token) {
      return { success: false, message: 'No authentication token available' };
    }
    try {
      let realNoteId = noteId;
      if (noteId < 0) {
        await forceSync();
        const { notes: updatedNotes } = await getAllNotes();
        const updatedNote = updatedNotes.find(n => n.sendNoteId === noteId);
        if (updatedNote && updatedNote.realNoteId > 0) {
          realNoteId = updatedNote.realNoteId;
        }
      }
      return await searchNoteById(token, realNoteId);
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, [token]);

  const forceSyncNow = useCallback(async () => {
    if (!isUnlocked) {
      return { success: false, message: 'Whiteboard is locked' };
    }
    try {
      await forceSync();
      const { notes: updatedNotes } = await getAllNotes();
      setNotes(updatedNotes || []);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, [isUnlocked]);

  const reset = useCallback(() => {
    setNotes([]);
    setIsPasswordSet(false);
    setIsUnlocked(false);
    setError(null);
    setSyncStatus('idle');
    stopSyncManager();
  }, []);

  const value = {
    notes,
    isPasswordSet,
    isUnlocked,
    loading,
    error,
    syncStatus,
    setupPasskey,
    unlockWhiteboard,
    createNote,
    updateNoteContent,
    updateNotePosition,
    searchNotes: searchNotesLocal,
    searchNoteById: searchNoteByIdRemote,
    forceSync: forceSyncNow,
    reset,
    passkeyChecked,
    initializing
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
