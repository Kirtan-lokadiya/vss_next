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

  useEffect(() => {
    const mockNotes = [
      {
        id: 1,
        title: "AI Integration Strategy",
        content: "Explore how we can integrate AI into our product workflow to improve user experience and automate repetitive tasks.",
        color: "blue",
        category: "Ideas",
        author: "John Doe",
        createdAt: "2025-01-10T10:30:00Z",
        position: { x: 100, y: 100 },
        zIndex: 1,
        comments: [
          {
            id: 1,
            text: "This could really streamline our development process",
            author: "Sarah Johnson",
            timestamp: "2025-01-10T11:00:00Z"
          }
        ]
      },
      {
        id: 2,
        title: "User Feedback Analysis",
        content: "Analyze recent user feedback to identify pain points and opportunities for improvement in our current features.",
        color: "yellow",
        category: "Research",
        author: "Sarah Johnson",
        createdAt: "2025-01-09T14:15:00Z",
        position: { x: 400, y: 150 },
        zIndex: 1,
        comments: []
      }
    ];

    const mockConnections = [
      { from: 1, to: 2, color: "#6366f1" }
    ];

    setNotes(mockNotes);
    setConnections(mockConnections);
    setFilteredNotes(mockNotes);
  }, []);

  useEffect(() => {
    const savedNotes = localStorage.getItem('whiteboard-notes');
    const savedConnections = localStorage.getItem('whiteboard-connections');
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedConnections) setConnections(JSON.parse(savedConnections));
  }, []);

  useEffect(() => {
    localStorage.setItem('whiteboard-notes', JSON.stringify(notes));
  }, [notes]);
  useEffect(() => {
    localStorage.setItem('whiteboard-connections', JSON.stringify(connections));
  }, [connections]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNotes(filtered);
    } else {
      setFilteredNotes(notes);
    }
  }, [notes, searchQuery]);

  useEffect(() => {
    const autoSave = () => {
      localStorage.setItem('whiteboard-notes', JSON.stringify(notes));
      localStorage.setItem('whiteboard-connections', JSON.stringify(connections));
    };

    const timer = setTimeout(autoSave, 2000);
    return () => clearTimeout(timer);
  }, [notes, connections]);

  const handleCreateNote = useCallback(async (noteData = {}) => {
    // Check if password is set
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5321';
  const SECURITY_BASE = `/api/security`;
    try {
      const res = await fetch(`${SECURITY_BASE}/passkeys-user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },        
      });
      const data = await res.json();
      if (data.customCode==404) {
        // Password not set, open modal to set password
        setPasswordIsSet(false);
        setPendingNoteData(noteData);
        setPasswordModalOpen(true);
        return;
      }
      // Password is set, open modal to enter password
      setPasswordIsSet(true);
      setPendingNoteData(noteData);
      setPasswordModalOpen(true);
    } catch (err) {
      setPasswordIsSet(false);
      setPendingNoteData(noteData);
      setPasswordModalOpen(true);
    }
  }, []);

  // Called after password modal success
  const handlePasswordSuccess = useCallback(() => {
    // Create note after password is set/entered
    const noteData = pendingNoteData || {};
    const newNote = {
      id: Date.now(),
      title: noteData.title || 'New Idea',
      content: noteData.content || 'Double-click to edit this note',
      color: noteData.color || 'yellow',
      category: noteData.category || '',
      author: "John Doe",
      createdAt: new Date().toISOString(),
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      zIndex: 1,
      comments: []
    };
    setNotes(prev => [...prev, newNote]);
    setPasswordModalOpen(false);
    setPendingNoteData(null);
  }, [pendingNoteData]);
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

  const handleMoveNote = useCallback((noteId, newPosition) => {
    setNotes(prev => prev.map(note =>
      note.id === noteId ? { ...note, position: newPosition } : note
    ));
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