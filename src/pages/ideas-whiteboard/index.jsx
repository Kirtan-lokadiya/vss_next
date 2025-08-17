import React, { useState, useEffect, useCallback } from 'react';
import PasswordModal from '@/src/components/ui/PasswordModal';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Header from '@/src/components/ui/Header';
import NavigationBreadcrumb from '@/src/components/ui/NavigationBreadcrumb';
import WhiteboardCanvas from './components/WhiteboardCanvas';
import NoteDetailsPanel from './components/NoteDetailsPanel';
import ToolbarTop from '@/src/pages/ideas-whiteboard/components/ToolbarTop';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';
import { useAuth } from '@/src/context/AuthContext';
import { getNotes, createEncryptedNote, updateNote } from '@/src/utils/notesApi';
import { decryptNoteContent } from '@/src/utils/notesApi';

const IdeasWhiteboard = () => {
  const [notes, setNotes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [scale, setScale] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [connectingMode, setConnectingMode] = useState(false);
  const [connectingFromId, setConnectingFromId] = useState(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordIsSet, setPasswordIsSet] = useState(false);
  const [pendingNoteData, setPendingNoteData] = useState(null);
  const [userPassword, setUserPassword] = useState('');
  const { token } = useAuth();

  // Prompt for password on mount if passkey exists (or to set one if missing)
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
          setPasswordIsSet(false);
        } else {
          setPasswordIsSet(true);
        }
        setPasswordModalOpen(true);
      } catch {
        // If check fails, still prompt for password
        setPasswordIsSet(true);
        setPasswordModalOpen(true);
      }
    })();
  }, [token]);

  // Load notes from backend and (if unlocked) decrypt content
  const loadNotes = useCallback(async () => {
    if (!token) return;
    const res = await getNotes(token, 1, 5, userPassword);
    if (!res.success) {
      // If incorrect password, prompt again
      if (res.message && res.message.toLowerCase().includes('password')) {
        setPasswordIsSet(true);
        setPasswordModalOpen(true);
      }
      setNotes([]);
      setFilteredNotes([]);
      return;
    }
    const list = Array.isArray(res.data) ? res.data : [];
    // Map backend model to whiteboard note model
    const mapped = await Promise.all(list.map(async (n) => {
      const properties = n.properties || {};
      let contentText = n.content;
      if (userPassword) {
        const decrypted = await decryptNoteContent(n.content, userPassword);
        if (decrypted) contentText = decrypted;
      }
      return {
        id: n.noteId || n.id,
        title: `Note #${n.noteId || n.id}`,
        content: contentText,
        color: properties.color || 'yellow',
        category: '',
        author: '',
        createdAt: new Date().toISOString(),
        position: { x: properties.x || 100, y: properties.y || 100 },
        zIndex: properties.z || 1,
        comments: [],
        raw: n,
      };
    }));
    setNotes(mapped);
    setFilteredNotes(mapped);
  }, [token, userPassword]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

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

  // No localStorage persistence — notes come from backend only

  const handleCreateNote = useCallback(async (noteData = {}) => {
    // Always check passkey; if set, ask for password (to decrypt after fetch)
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
        setPasswordIsSet(false);
      } else {
        setPasswordIsSet(true);
      }
      setPendingNoteData(noteData);
      setPasswordModalOpen(true);
    } catch (err) {
      setPasswordIsSet(false);
      setPendingNoteData(noteData);
      setPasswordModalOpen(true);
    }
  }, [token]);

  // Called after password modal success
  const handlePasswordSuccess = useCallback(async (enteredPassword) => {
    setUserPassword(enteredPassword || userPassword);
    // First load and decrypt notes for this user
    await loadNotes();
    // If creation was requested, create a blank note via API, then reload
    if (pendingNoteData) {
      const payload = {
        content: pendingNoteData.content || 'New note',
        properties: {
          x: 100,
          y: 100,
          z: 5,
          color: '#ffffff',
          height: 100,
          width: 200,
        },
      };
      await createEncryptedNote(token, payload);
      await loadNotes();
    }
    setPasswordModalOpen(false);
    setPendingNoteData(null);
  }, [pendingNoteData, token, loadNotes, userPassword]);
  const handleUpdateNote = useCallback((noteId, updates) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, ...updates } : note
    ));
  }, []);

  const handleDeleteNote = useCallback((noteId) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    setConnections(prev => prev.filter(conn => 
      conn.from !== noteId && conn.to !== noteId
    ));
    if (selectedNoteId === noteId) {
      setSelectedNoteId(null);
      setShowDetailsPanel(false);
    }
  }, [selectedNoteId]);

  const handleMoveNote = useCallback(async (noteId, newPosition) => {
    setNotes(prev => prev.map(note => (note.id === noteId ? { ...note, position: newPosition } : note)));
    // Push to backend
    await updateNote(token, noteId, { x: newPosition.x, y: newPosition.y });
  }, [token]);

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

  const selectedNote = notes.find(note => note.id === selectedNoteId);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background">
        {/* Only one header and breadcrumb, not duplicated */}
        <Header />
        <div className="pt-16">
          <div className="px-6 py-4 border-b border-border">
            <NavigationBreadcrumb />
          </div>

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
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
                onMoveNote={handleMoveNote}
                selectedNoteId={selectedNoteId}
                onSelectNote={handleSelectNote}
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
              />
            </div>
          </div>

          {/* Right Details Panel remains if a note is selected */}
          {showDetailsPanel && selectedNote && (
            <NoteDetailsPanel
              note={selectedNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onClose={() => { setShowDetailsPanel(false); setSelectedNoteId(null); }}
              connections={connections}
              allNotes={notes}
              onCreateConnection={() => {}}
              onDeleteConnection={() => {}}
            />
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default IdeasWhiteboard;