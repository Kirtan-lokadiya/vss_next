import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Header from '@/src/components/ui/Header';
import NavigationBreadcrumb from '@/src/components/ui/NavigationBreadcrumb';
import WhiteboardCanvas from './components/WhiteboardCanvas';
import NoteDetailsPanel from './components/NoteDetailsPanel';
import ToolbarTop from '@/src/pages/ideas-whiteboard/components/ToolbarTop';
import Icon from '@/src/components/AppIcon';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/context/ToastContext';
import { getNotes, createNote, updateNote } from '@/src/utils/notesApi';

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
  const { token } = useAuth();
  const { showToast } = useToast();
  const [notesPassword, setNotesPassword] = useState('');

  // Load notes from backend (backend handles decryption)
  const loadNotes = useCallback(async () => {
    if (!token) return;
    const res = await getNotes(token, 1, 50, notesPassword);
    if (!res.success) {
      const isWrongPassword = res.isWrongPassword || res.code === 1001 || /Decrypt/i.test(res.message || '');
      showToast(isWrongPassword ? 'Incorrect password. Please try again.' : (res.message || 'Failed to load notes'));
      setNotes([]);
      setFilteredNotes([]);
      return;
    }
    const list = Array.isArray(res.data) ? res.data : [];
    // Map backend model to whiteboard note model
    const mapped = list.map((n) => {
      const properties = n.properties || {};
      const contentText = n.content;
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
    });
    setNotes(mapped);
    setFilteredNotes(mapped);
  }, [token, showToast, notesPassword]);

  useEffect(() => { loadNotes(); }, [loadNotes]);
  useEffect(() => { if (notesPassword) { loadNotes(); } }, [notesPassword, loadNotes]);

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

  // Create a new note (no client-side encryption)
  const handleCreateNote = useCallback(async (noteData = {}) => {
    const payload = {
      content: noteData.content || 'New note',
      properties: {
        x: 100,
        y: 100,
        z: 5,
        color: '#ffffff',
        height: 100,
        width: 200,
      },
    };
    const res = await createNote(token, payload);
    if (!res.success) {
      showToast(res.message || 'Failed to create note');
      return;
    }
    await loadNotes();
  }, [token, loadNotes, showToast]);

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
    const result = await updateNote(token, noteId, { x: newPosition.x, y: newPosition.y });
    if (!result.success) {
      showToast(result.message || 'Failed to update note position');
    }
  }, [token, showToast]);

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
              notesPassword={notesPassword}
              onPasswordChange={setNotesPassword}
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