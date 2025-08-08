import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Header from '@/src/components/ui/Header';
import NavigationBreadcrumb from '@/src/components/ui/NavigationBreadcrumb';
import ToolbarLeft from './components/ToolbarLeft';
import ToolbarTop from './components/ToolbarTop';
import WhiteboardCanvas from './components/WhiteboardCanvas';
import NoteDetailsPanel from './components/NoteDetailsPanel';
import CollaborationPanel from './components/CollaborationPanel';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';



const IdeasWhiteboard = () => {
  const [notes, setNotes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [scale, setScale] = useState(1);
  const [viewMode, setViewMode] = useState('freeform');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [connectingMode, setConnectingMode] = useState(false);
  const [connectingFromId, setConnectingFromId] = useState(null);

  // Mock data initialization
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
      },
      {
        id: 3,
        title: "Q2 Product Roadmap",
        content: "Define key milestones and deliverables for the second quarter, including new feature releases and performance improvements.",
        color: "green",
        category: "Goals",
        author: "Mike Chen",
        createdAt: "2025-01-08T09:45:00Z",
        position: { x: 250, y: 300 },
        zIndex: 1,
        comments: []
      },
      {
        id: 4,
        title: "Mobile App Performance",
        content: "Investigate and resolve performance issues reported in the mobile application, particularly on older devices.",
        color: "pink",
        category: "Tasks",
        author: "Alex Kim",
        createdAt: "2025-01-07T16:20:00Z",
        position: { x: 600, y: 250 },
        zIndex: 1,
        comments: []
      },
      {
        id: 5,
        title: "Team Collaboration Tools",
        content: "Research and evaluate new collaboration tools that could enhance remote team productivity and communication.",
        color: "purple",
        category: "Research",
        author: "Emily Davis",
        createdAt: "2025-01-06T13:10:00Z",
        position: { x: 150, y: 450 },
        zIndex: 1,
        comments: []
      }
    ];

    const mockConnections = [
      { from: 1, to: 2, color: "#6366f1" },
      { from: 2, to: 3, color: "#10b981" }
    ];

    const mockCollaborators = [
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@company.com",
        role: "owner",
        status: "active",
        lastActive: "2025-01-12T07:01:45Z"
      },
      {
        id: 2,
        name: "Sarah Johnson",
        email: "sarah.johnson@company.com",
        role: "editor",
        status: "active",
        lastActive: "2025-01-12T06:45:00Z"
      },
      {
        id: 3,
        name: "Mike Chen",
        email: "mike.chen@company.com",
        role: "editor",
        status: "offline",
        lastActive: "2025-01-11T18:30:00Z"
      }
    ];

    setNotes(mockNotes);
    setConnections(mockConnections);
    setCollaborators(mockCollaborators);
    setFilteredNotes(mockNotes);
  }, []);
  // Load from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('whiteboard-notes');
    const savedConnections = localStorage.getItem('whiteboard-connections');
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedConnections) setConnections(JSON.parse(savedConnections));
  }, []);

  // Save to localStorage on notes/connections change
  useEffect(() => {
    localStorage.setItem('whiteboard-notes', JSON.stringify(notes));
  }, [notes]);
  useEffect(() => {
    localStorage.setItem('whiteboard-connections', JSON.stringify(connections));
  }, [connections]);

  // Filter notes based on search query
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

  // Auto-save functionality
  useEffect(() => {
    const autoSave = () => {
      localStorage.setItem('whiteboard-notes', JSON.stringify(notes));
      localStorage.setItem('whiteboard-connections', JSON.stringify(connections));
    };

    const timer = setTimeout(autoSave, 2000);
    return () => clearTimeout(timer);
  }, [notes, connections]);

  const handleCreateNote = useCallback((noteData) => {
    const newNote = {
      id: Date.now(),
      title: noteData.title,
      content: noteData.content,
      color: noteData.color,
      category: noteData.category,
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
  }, []);

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
    
    if (connectingMode && connectingFromId && connectingFromId !== noteId) {
      // Create connection
      const newConnection = {
        from: connectingFromId,
        to: noteId,
        color: "#6366f1"
      };
      setConnections(prev => [...prev, newConnection]);
      setConnectingMode(false);
      setConnectingFromId(null);
    }
  }, [connectingMode, connectingFromId]);

  const handleConnectNotes = useCallback((noteId) => {
    if (connectingMode) {
      setConnectingMode(false);
      setConnectingFromId(null);
    } else {
      setConnectingMode(true);
      setConnectingFromId(noteId);
    }
  }, [connectingMode]);

  const handleCreateConnection = useCallback((fromId, toId) => {
    const connectionExists = connections.some(conn =>
      (conn.from === fromId && conn.to === toId) ||
      (conn.from === toId && conn.to === fromId)
    );
    
    if (!connectionExists) {
      const newConnection = {
        from: fromId,
        to: toId,
        color: "#6366f1"
      };
      setConnections(prev => [...prev, newConnection]);
    }
  }, [connections]);

  const handleDeleteConnection = useCallback((fromId, toId) => {
    setConnections(prev => prev.filter(conn =>
      !((conn.from === fromId && conn.to === toId) ||
        (conn.from === toId && conn.to === fromId))
    ));
  }, []);

  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.25));
  }, []);

  const handleResetZoom = useCallback(() => {
    setScale(1);
  }, []);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleClearBoard = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the entire board? This action cannot be undone.')) {
      setNotes([]);
      setConnections([]);
      setSelectedNoteId(null);
      setShowDetailsPanel(false);
    }
  }, []);

  const handleSave = useCallback(() => {
    localStorage.setItem('whiteboard-notes', JSON.stringify(notes));
    localStorage.setItem('whiteboard-connections', JSON.stringify(connections));
  }, [notes, connections]);

  const handleToggleCollaboration = useCallback(() => {
    if (!isCollaborative) {
      setShowCollaborationPanel(true);
    }
    setIsCollaborative(!isCollaborative);
  }, [isCollaborative]);

  const handleInviteUser = useCallback((userData) => {
    const newCollaborator = {
      id: Date.now(),
      name: userData.email.split('@')[0],
      email: userData.email,
      role: userData.role,
      status: 'pending',
      lastActive: null
    };
    setCollaborators(prev => [...prev, newCollaborator]);
  }, []);

  const handleRemoveUser = useCallback((userId) => {
    setCollaborators(prev => prev.filter(user => user.id !== userId));
  }, []);

  const handleImportNotes = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedData = JSON.parse(e.target.result);
            if (importedData.notes) {
              setNotes(prev => [...prev, ...importedData.notes]);
            }
            if (importedData.connections) {
              setConnections(prev => [...prev, ...importedData.connections]);
            }
          } catch (error) {
            alert('Invalid file format');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  const handleExportNotes = useCallback(() => {
    const exportData = {
      notes,
      connections,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whiteboard-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [notes, connections]);

  const handleCanvasClick = useCallback(() => {
    if (connectingMode) {
      setConnectingMode(false);
      setConnectingFromId(null);
    }
    setSelectedNoteId(null);
    setShowDetailsPanel(false);
  }, [connectingMode]);

  const selectedNote = notes.find(note => note.id === selectedNoteId);
  const currentUser = collaborators.find(user => user.role === 'owner') || collaborators[0];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="pt-16">
          {/* Breadcrumb */}
          <div className="px-6 py-4 border-b border-border">
            <NavigationBreadcrumb />
          </div>

          {/* Main Content */}
          <div className="flex h-[calc(100vh-8rem)]">
            {/* Left Toolbar */}
            <ToolbarLeft
              onCreateNote={handleCreateNote}
              onImportNotes={handleImportNotes}
              onExportNotes={handleExportNotes}
            />

            {/* Main Whiteboard Area */}
            <div className="flex-1 flex flex-col">
              {/* Top Toolbar */}
              <ToolbarTop
                scale={scale}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                onSearch={handleSearch}
                searchQuery={searchQuery}
                onClearBoard={handleClearBoard}
                onSave={handleSave}
                isCollaborative={isCollaborative}
                onToggleCollaboration={handleToggleCollaboration}
                collaborators={collaborators}
              />

              {/* Canvas */}
              <div className="flex-1 relative">
                <WhiteboardCanvas
                  notes={filteredNotes}
                  connections={connections}
                  onUpdateNote={handleUpdateNote}
                  onDeleteNote={handleDeleteNote}
                  onMoveNote={handleMoveNote}
                  selectedNoteId={selectedNoteId}
                  onSelectNote={handleSelectNote}
                  onConnectNotes={handleConnectNotes}
                  scale={scale}
                  viewMode={viewMode}
                  onCanvasClick={handleCanvasClick}
                />

                {/* Connecting Mode Overlay */}
                {connectingMode && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-1010">
                    <div className="flex items-center space-x-2">
                      <Icon name="Link" size={16} />
                      <span className="text-sm">Click another note to create connection</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setConnectingMode(false);
                          setConnectingFromId(null);
                        }}
                        className="w-6 h-6 text-primary-foreground hover:bg-primary-foreground/20"
                      >
                        <Icon name="X" size={14} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Details Panel */}
            {showDetailsPanel && selectedNote && (
              <NoteDetailsPanel
                note={selectedNote}
                onUpdateNote={handleUpdateNote}
                onDeleteNote={handleDeleteNote}
                onClose={() => {
                  setShowDetailsPanel(false);
                  setSelectedNoteId(null);
                }}
                connections={connections}
                allNotes={notes}
                onCreateConnection={handleCreateConnection}
                onDeleteConnection={handleDeleteConnection}
              />
            )}
          </div>
        </div>

        {/* Collaboration Panel */}
        <CollaborationPanel
          isVisible={showCollaborationPanel}
          onClose={() => setShowCollaborationPanel(false)}
          collaborators={collaborators}
          onInviteUser={handleInviteUser}
          onRemoveUser={handleRemoveUser}
          currentUser={currentUser}
        />
      </div>
    </DndProvider>
  );
};

export default IdeasWhiteboard;