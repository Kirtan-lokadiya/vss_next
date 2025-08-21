import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Header from '@/src/components/ui/Header';
import WhiteboardCanvas from './components/WhiteboardCanvas';
import ToolbarTop from '@/src/pages/ideas-whiteboard/components/ToolbarTop';
import WhiteboardPasswordModal from '@/src/components/ui/WhiteboardPasswordModal';
import Icon from '@/src/components/AppIcon';
import { useAuth } from '@/src/context/AuthContext';
import { useWhiteboard } from '@/src/context/WhiteboardContext';

const IdeasWhiteboard = () => {
  const [scale, setScale] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  
  const { token, isAuthenticated } = useAuth();
  const { 
    notes, 
    isPasswordSet, 
    isUnlocked, 
    loading, 
    error,
    createNote, 
    updateNoteContent, 
    updateNotePosition, 
    deleteNote,
    searchNotes,
    searchNoteById,
    reset
  } = useWhiteboard();

  // Show password modal when user visits and is authenticated
  useEffect(() => {
    if (isAuthenticated && token && !isUnlocked && !showPasswordModal) {
      setShowPasswordModal(true);
    }
  }, [isAuthenticated, token, isUnlocked, showPasswordModal]);

  // Reset whiteboard when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      reset();
      setShowPasswordModal(false);
    }
  }, [isAuthenticated, reset]);

  // Filter notes based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = notes.filter(note =>
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNotes(filtered);
    } else {
      setFilteredNotes(notes);
      setSearchResults(null);
    }
  }, [notes, searchQuery]);

  // Handle password modal close
  const handlePasswordModalClose = useCallback(() => {
    if (isUnlocked) {
      setShowPasswordModal(false);
    }
  }, [isUnlocked]);

  // Handle creating a new note
  const handleCreateNote = useCallback(async () => {
    if (!isUnlocked) return;

    try {
      await createNote('New note');
    } catch (error) {
      console.error('Error creating note:', error);
    }
  }, [isUnlocked, createNote]);

  // Handle note content update
  const handleUpdateNote = useCallback(async (noteId, updates) => {
    if (!isUnlocked) return;

    try {
      if (updates.content !== undefined) {
        await updateNoteContent(noteId, updates.content);
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  }, [isUnlocked, updateNoteContent]);

  // Handle note position update
  const handleMoveNote = useCallback(async (noteId, newPosition) => {
    if (!isUnlocked) return;

    try {
      // Find the note to get current properties
      const note = notes.find(n => n.noteId === noteId);
      if (note) {
        const updatedProperties = {
          ...note.properties,
          x: newPosition.x,
          y: newPosition.y
        };
        await updateNotePosition(noteId, updatedProperties);
      }
    } catch (error) {
      console.error('Error moving note:', error);
    }
  }, [isUnlocked, notes, updateNotePosition]);

  // Handle note deletion
  const handleDeleteNote = useCallback(async (noteId) => {
    if (!isUnlocked) return;

    try {
      await deleteNote(noteId);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }, [isUnlocked, deleteNote]);

  // Handle local search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Handle global search
  const handleGlobalSearch = useCallback(async (query) => {
    if (!isUnlocked || !query.trim()) return;

    try {
      // First search locally
      const localResults = await searchNotes(query);
      
      if (localResults.success && localResults.notes.length > 0) {
        // If we have local results, use the first one for global search
        const firstNote = localResults.notes[0];
        const globalResults = await searchNoteById(firstNote.noteId);
        
        if (globalResults.success) {
          setSearchResults({
            query,
            localResults: localResults.notes,
            globalResults: globalResults.users || []
          });
        }
      }
    } catch (error) {
      console.error('Error performing global search:', error);
    }
  }, [isUnlocked, searchNotes, searchNoteById]);

  // Transform notes for canvas display
  const canvasNotes = filteredNotes.map(note => ({
    id: note.noteId,
    title: `Note #${Math.abs(note.noteId)}`,
    content: note.content,
    color: note.properties?.color || '#ffffff',
    createdAt: new Date().toISOString(),
    position: { 
      x: note.properties?.x || 100, 
      y: note.properties?.y || 100 
    },
    zIndex: note.properties?.z || 1,
    size: { 
      width: note.properties?.width || 200, 
      height: note.properties?.height || 100 
    },
    comments: [],
    raw: note,
  }));

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading whiteboard...</p>
        </div>
      </div>
    );
  }

  // Show authentication required
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Lock" size={48} className="text-text-secondary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Authentication Required</h2>
          <p className="text-text-secondary">Please log in to access the whiteboard.</p>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <div className="h-[calc(100vh-8rem)] flex flex-col">
            {/* Top Toolbar */}
            <ToolbarTop
              scale={scale}
              onSearch={handleSearch}
              searchQuery={searchQuery}
              onGlobalSearch={handleGlobalSearch}
            />

            {/* Main Canvas Area */}
            <div className="flex-1 relative">
              {/* Show unlock message when locked */}
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                  <div className="text-center">
                    <Icon name="Lock" size={48} className="text-text-secondary mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-foreground mb-2">Whiteboard Locked</h2>
                    <p className="text-text-secondary mb-4">Enter your password to access your notes</p>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    >
                      Unlock Whiteboard
                    </button>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {isUnlocked && filteredNotes.length === 0 && !searchQuery && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <Icon name="StickyNote" size={48} className="text-text-secondary mx-auto mb-2" />
                    <div className="text-lg font-medium text-foreground">Create your first note</div>
                    <div className="text-sm text-text-secondary">Click the + button to add a quick note</div>
                  </div>
                </div>
              )}

              {/* No search results */}
              {isUnlocked && filteredNotes.length === 0 && searchQuery && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <Icon name="Search" size={48} className="text-text-secondary mx-auto mb-2" />
                    <div className="text-lg font-medium text-foreground">No notes found</div>
                    <div className="text-sm text-text-secondary">Try a different search term</div>
                  </div>
                </div>
              )}

              {/* Search results display */}
              {searchResults && (
                <div className="absolute top-4 right-4 bg-card border border-border rounded-lg p-4 max-w-sm z-20">
                  <h3 className="font-semibold text-foreground mb-2">Search Results</h3>
                  <p className="text-sm text-text-secondary mb-3">Query: "{searchResults.query}"</p>
                  
                  {searchResults.globalResults.length > 0 && (
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Found Users:</h4>
                      <ul className="space-y-1">
                        {searchResults.globalResults.map(user => (
                          <li key={user.id} className="text-sm text-text-secondary">
                            {user.name} (ID: {user.id})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setSearchResults(null)}
                    className="mt-3 text-sm text-primary hover:text-primary/80"
                  >
                    Close
                  </button>
                </div>
              )}

              {/* Whiteboard Canvas */}
              {isUnlocked && (
                <WhiteboardCanvas
                  notes={canvasNotes}
                  connections={[]}
                  onUpdateNote={handleUpdateNote}
                  onDeleteNote={handleDeleteNote}
                  onMoveNote={handleMoveNote}
                  selectedNoteId={null}
                  onSelectNote={() => {}}
                  onConnectNotes={() => {}}
                  scale={scale}
                  viewMode="grid"
                  onCanvasClick={() => {}}
                />
              )}

              {/* Floating Create Button */}
              {isUnlocked && (
                <button
                  onClick={handleCreateNote}
                  className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors z-30"
                  title="Create note"
                >
                  <Icon name="Plus" size={24} />
                </button>
              )}

              {/* Error display */}
              {error && (
                <div className="absolute bottom-4 left-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg z-20">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Password Modal */}
        <WhiteboardPasswordModal
          open={showPasswordModal}
          onClose={handlePasswordModalClose}
        />
      </div>
    </DndProvider>
  );
};

export default IdeasWhiteboard;