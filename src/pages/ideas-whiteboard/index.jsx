import React, { useState, useEffect, useCallback, useRef } from 'react';
import PasswordModal from '@/src/components/ui/PasswordModal';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Header from '@/src/components/ui/Header';
import WhiteboardCanvas from './components/WhiteboardCanvas';
import ToolbarTop from '@/src/pages/ideas-whiteboard/components/ToolbarTop';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';
import { useAuth } from '@/src/context/AuthContext';
import { getNotes, createNote, updateNote, updateNoteContent } from '@/src/utils/notesApi';

const IdeasWhiteboard = () => {
  const [notes, setNotes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [scale, setScale] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordIsSet, setPasswordIsSet] = useState(false);
  const [pendingNoteData, setPendingNoteData] = useState(null);
  const [userPassword, setUserPassword] = useState('');
  const { token } = useAuth();

  // Debounce timers per noteId for saving
  const saveTimersRef = useRef(new Map());

  // Prompt when visiting ideas page; check server for passkey and open modal
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`/api/security/passkeys-user`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        if (data?.errors && data.errors.message === 'Security Key Not Found') {
          setPasswordIsSet(false); // show Set Password
        } else if (data?.id && data?.publicKey) {
          setPasswordIsSet(true); // show Unlock password prompt
        } else {
          setPasswordIsSet(true);
        }
        setPasswordModalOpen(true);
      } catch {
        setPasswordIsSet(true);
        setPasswordModalOpen(true);
      }
    })();
  }, [token]);

  // Load notes from backend after unlock
  const loadNotes = useCallback(async () => {
    if (!token) return;
    // Don't call API without password - this prevents incomplete requests
    if (!userPassword) return;

    const res = await getNotes(token, 1, 5, userPassword);
    if (!res.success) {
      console.error('Error loading notes:', res.error);
      // Check if it's a password error
      if (res.api?.customCode === 1001 || res.customCode === 1001) {
        setPasswordError("Wrong password! Please try again.");
        setPasswordModalOpen(true);   // keep modal open
        setNotes([]);
      }
      return;
    }

    // ✅ Clear error if successful (including empty page)
    setPasswordError('');

    // Normal success (including empty notes list)
    const list = res.data || [];
    const mapped = await Promise.all(list.map(async (n) => {
      const properties = n.properties || {};
      return {
        id: n.noteId || n.id,
        title: `Note #${n.noteId || n.id}`,
        content: n.content,
        color: properties.color || '#ffffff',
        createdAt: new Date().toISOString(),
        position: { x: properties.x ?? 100, y: properties.y ?? 100 },
        zIndex: properties.z ?? 1,
        size: { width: properties.width ?? 200, height: properties.height ?? 100 },
        comments: [],
        raw: n,
      };
    }));
    setNotes(mapped);
    setFilteredNotes(mapped);
  }, [token, userPassword]);

  // Only load notes when we have a password
  useEffect(() => {
    if (userPassword) {
      loadNotes();
    }
  }, [loadNotes]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = notes.filter(note =>
        (note.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.content || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNotes(filtered);
    } else {
      setFilteredNotes(notes);
    }
  }, [notes, searchQuery]);

  // Called after password modal success
  const handlePasswordSuccess = useCallback(async (enteredPassword) => {
    setUserPassword(enteredPassword || userPassword);

    // Try to load notes with the password
    const res = await getNotes(token, 1, 5, enteredPassword);

    if (!res.success) {
      // Wrong password (401 Unauth) from backend
      if (res.status === 401 || (res.api && res.api.status === 401)) {
        setPasswordError('Wrong password! Please try again.');
        setPasswordModalOpen(true);
        setNotes([]);
        return;
      }
      if (res.api?.customCode === 1001 || res.customCode === 1001) {
        setPasswordError('Wrong password! Please try again.');
        setPasswordModalOpen(true);
        setNotes([]);
        return;
      } else {
        console.error('Error loading notes:', res.error);
        setPasswordError('Failed to load notes. Please try again.');
        setPasswordModalOpen(true);
        return;
      }
    }

    // ✅ Success - clear error and close modal
    setPasswordError('');
    setPasswordModalOpen(false);

    // Load notes successfully (including empty list)
    const list = res.data || [];
    const mapped = await Promise.all(list.map(async (n) => {
      const properties = n.properties || {};
      return {
        id: n.noteId || n.id,
        title: `Note #${n.noteId || n.id}`,
        content: n.content,
        color: properties.color || '#ffffff',
        createdAt: new Date().toISOString(),
        position: { x: properties.x ?? 100, y: properties.y ?? 100 },
        zIndex: properties.z ?? 1,
        size: { width: properties.width ?? 200, height: properties.height ?? 100 },
        comments: [],
        raw: n,
      };
    }));
    setNotes(mapped);
    setFilteredNotes(mapped);

    // If creation was requested, create a blank note via API, then reload
    if (pendingNoteData) {
      const baseX = 100, baseY = 100, delta = 24;
      const idx = mapped.length;
      const payload = {
        content: pendingNoteData.content || 'New note',
        properties: { x: baseX + (idx % 5) * delta, y: baseY + (idx % 5) * delta, z: 5, color: '#ffffff', height: 100, width: 200 },
      };
      await createNote(token, payload);
      await loadNotes();
      setPendingNoteData(null);
    }
  }, [pendingNoteData, token, userPassword, loadNotes]);

  // Helper: compute next position in a simple grid to avoid overlap
  const computeNextPosition = useCallback(() => {
    const baseX = 100, baseY = 100, step = 48, perRow = 6;
    const idx = notes.length;
    const col = idx % perRow;
    const row = Math.floor(idx / perRow);
    return { x: baseX + col * step, y: baseY + row * step };
  }, [notes.length]);

  const handleCreateNote = useCallback(async (noteData = {}) => {
    if (!token || !userPassword) return;

    // Compute next position
    const baseX = 100, baseY = 100, step = 48, perRow = 6;
    const idx = notes.length;
    const nextPos = { x: baseX + (idx % perRow) * step, y: baseY + Math.floor(idx / perRow) * step };

    // Optimistic insert
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      title: `Note #${tempId}`,
      content: noteData.content || 'New note',
      color: 'yellow',
      createdAt: new Date().toISOString(),
      position: nextPos,
      zIndex: 1,
      comments: [],
      raw: {},
    };
    setNotes(prev => [...prev, optimistic]);
    setFilteredNotes(prev => [...prev, optimistic]);
    setSelectedNoteId(null);
    setShowDetailsPanel(false);

    // POST to create on server
    const payload = {
      content: optimistic.content,
      properties: { x: nextPos.x, y: nextPos.y, z: 5, color: 'yellow', height: 100, width: 200 },
    };
    const created = await createNote(token, payload);
    if (created?.success && created.note) {
      const newId = created.note.noteId || created.note.id;
      // Replace temp note with server one
      setNotes(prev => prev.map(n => n.id === tempId ? { ...n, id: newId, title: `Note #${newId}`, raw: created.note } : n));
      setFilteredNotes(prev => prev.map(n => n.id === tempId ? { ...n, id: newId, title: `Note #${newId}`, raw: created.note } : n));
    } else {
      // On failure, remove optimistic note
      setNotes(prev => prev.filter(n => n.id !== tempId));
      setFilteredNotes(prev => prev.filter(n => n.id !== tempId));
    }
  }, [token, userPassword, notes.length]);

  // Do not PUT on drag anymore; only update UI state
  const handleMoveNote = useCallback(async (noteId, newPosition) => {
    setNotes(prev => prev.map(note => (note.id === noteId ? { ...note, position: newPosition } : note)));
  }, []);

  const handleSelectNote = useCallback((noteId) => {
    setSelectedNoteId(noteId);
    setShowDetailsPanel(true);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleCanvasClick = useCallback(() => {
    setSelectedNoteId(null);
    setShowDetailsPanel(false);
  }, []);

  const handleUpdateNote = useCallback((noteId, updates) => {
    setNotes(prev => prev.map(note => note.id === noteId ? { ...note, ...updates } : note));
  }, []);

  // Save edited content to backend when StickyNote triggers save
  const handleSaveNoteContent = useCallback(async (noteId, updates) => {
    const tokenToUse = token;
    await updateNoteContent(tokenToUse, noteId, { title: updates.title, content: updates.content });
    // Reflect saved values in state
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, title: updates.title, content: updates.content } : n));
    setFilteredNotes(prev => prev.map(n => n.id === noteId ? { ...n, title: updates.title, content: updates.content } : n));
  }, [token]);

  const handleDeleteNote = useCallback(async (noteId) => {
    if (!token) return;
    const res = await updateNote(token, noteId, { isDeleted: true });
    if (res.success) {
      setNotes(prev => prev.filter(n => n.id !== noteId));
      setFilteredNotes(prev => prev.filter(n => n.id !== noteId));
    } else {
      console.error('Error deleting note:', res.error);
    }
  }, [token]);

  const selectedNote = notes.find(note => note.id === selectedNoteId);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background">
        {/* Top navbar only */}
        <Header />
        <div className="pt-16">
          {/* Main Content - no left/right panels */}
          <div className="h-[calc(100vh-8rem)] flex flex-col">
            {/* Top Bar with only search */}
            <ToolbarTop
              scale={scale}
              onSearch={handleSearch}
              searchQuery={searchQuery}
            />

            {/* Canvas */}
            <div className="flex-1 relative">
              {/* Empty state */}
              {filteredNotes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <Icon name="StickyNote" size={48} className="text-text-secondary mx-auto mb-2" />
                    <div className="text-lg font-medium text-foreground">Create your first note</div>
                    <div className="text-sm text-text-secondary">Click the + button to add a quick note</div>
                  </div>
                </div>
              )}

              <WhiteboardCanvas
                notes={filteredNotes}
                connections={connections}
                onUpdateNote={handleSaveNoteContent}
                onDeleteNote={handleDeleteNote}
                onMoveNote={handleMoveNote}
                selectedNoteId={null}
                onSelectNote={() => {}}
                onConnectNotes={() => {}}
                scale={scale}
                viewMode={'grid'}
                onCanvasClick={handleCanvasClick}
              />

              {/* Floating Create Button */}
              <button
                onClick={() => handleCreateNote({})}
                className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90"
                title="Create note"
              >
                <Icon name="Plus" size={24} />
              </button>
              <PasswordModal
                open={passwordModalOpen}
                onClose={() => setPasswordModalOpen(false)}
                onSuccess={handlePasswordSuccess}
                isSet={passwordIsSet}
                error={passwordError}
              />
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default IdeasWhiteboard;