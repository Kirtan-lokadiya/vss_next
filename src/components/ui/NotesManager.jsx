import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePasskey } from '../../context/PasskeyContext';
import { useToast } from '../../context/ToastContext';
import {
  getNotes,
  createEncryptedNote,
  createNote,
  updateNote,
  deleteNote,
  decryptNoteContent,
  isNoteEncrypted,
  checkPasskeyExists
} from '../../utils/notesApi';
import Button from './Button';
import Input from './Input';

const NotesManager = ({ className = '' }) => {
  const { token, isAuthenticated } = useAuth();
  const { isPasskeySet } = usePasskey();
  const { showToast } = useToast();
  
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  
  // Password states
  const [password, setPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passkeyStatus, setPasskeyStatus] = useState({ isSet: false, checked: false });
  const [passwordError, setPasswordError] = useState('');
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteProperties, setNoteProperties] = useState({
    x: 10,
    y: 20,
    z: 5,
    color: '#ffffff',
    height: 100,
    width: 200
  });
  const [useEncryption, setUseEncryption] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check passkey status on component mount
  useEffect(() => {
    if (isAuthenticated && token && !passkeyStatus.checked) {
      checkUserPasskeyStatus();
    }
  }, [isAuthenticated, token, passkeyStatus.checked]);

  // Load notes when authenticated, passkey status is known, and password is provided (if needed)
  useEffect(() => {
    if (isAuthenticated && token && passkeyStatus.checked) {
      if (passkeyStatus.isSet && !password) {
        setShowPasswordPrompt(true);
      } else {
        loadNotes();
      }
    }
  }, [isAuthenticated, token, currentPage, password, passkeyStatus]);

  const checkUserPasskeyStatus = async () => {
    try {
      const result = await checkPasskeyExists(token);
      if (result.success) {
        setPasskeyStatus({ isSet: result.isSet, checked: true });
        if (result.isSet) {
          setShowPasswordPrompt(true);
        }
      } else {
        showToast(result.message || 'Failed to check passkey status', 'error');
      }
    } catch (error) {
      console.error('Error checking passkey status:', error);
      showToast('Error checking passkey status', 'error');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setPasswordError('Please enter your password');
      return;
    }
    
    setPasswordError('');
    setShowPasswordPrompt(false);
    // loadNotes will be called by useEffect when password changes
  };

  const loadNotes = async () => {
    setLoading(true);
    setPasswordError('');
    try {
      const result = await getNotes(token, currentPage, pageSize, password);
      if (result.success) {
        setNotes(result.data || []);
      } else {
        if (result.code === 1001 && result.wrongPassword) {
          setPasswordError('Incorrect password. Please try again.');
          setPassword('');
          setShowPasswordPrompt(true);
        } else if (result.code === 1002 && result.requiresPassword) {
          setShowPasswordPrompt(true);
        } else {
          showToast(result.message || 'Failed to load notes', 'error');
        }
      }
    } catch (error) {
      showToast('Error loading notes', 'error');
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    
    if (!noteContent.trim()) {
      showToast('Please enter note content', 'error');
      return;
    }

    if (useEncryption && !passkeyStatus.isSet) {
      showToast('Encryption requires a passkey to be set', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const noteData = {
        userId: 1, // This should come from user context
        content: noteContent,
        properties: noteProperties
      };

      let result;
      if (useEncryption && isPasskeySet) {
        result = await createEncryptedNote(token, noteData, password);
      } else {
        result = await createNote(token, noteData);
      }

      if (result.success) {
        showToast('Note created successfully!', 'success');
        setNoteContent('');
        setShowCreateForm(false);
        loadNotes(); // Refresh the notes list
      } else {
        showToast(result.message || 'Failed to create note', 'error');
      }
    } catch (error) {
      showToast('Error creating note', 'error');
      console.error('Error creating note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const result = await deleteNote(token, noteId);
      if (result.success) {
        showToast('Note deleted successfully!', 'success');
        loadNotes(); // Refresh the notes list
      } else {
        showToast(result.message || 'Failed to delete note', 'error');
      }
    } catch (error) {
      showToast('Error deleting note', 'error');
      console.error('Error deleting note:', error);
    }
  };

  const handleDecryptNote = async (note, notePassword) => {
    if (!notePassword.trim()) {
      showToast('Please enter your password to decrypt this note', 'error');
      return;
    }

    try {
      const decryptedContent = await decryptNoteContent(note.content, notePassword);
      if (decryptedContent) {
        showToast('Note decrypted successfully!', 'success');
        // You could show the decrypted content in a modal or update the note display
        console.log('Decrypted content:', decryptedContent);
      } else {
        showToast('Failed to decrypt note. Check your password.', 'error');
      }
    } catch (error) {
      showToast('Error decrypting note', 'error');
      console.error('Error decrypting note:', error);
    }
  };

  const resetForm = () => {
    setNoteContent('');
    setNoteProperties({
      x: 10,
      y: 20,
      z: 5,
      color: '#ffffff',
      height: 100,
      width: 200
    });
    setUseEncryption(false);
    setShowCreateForm(false);
  };

  if (!isAuthenticated) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border p-6 ${className}`}>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Please log in to manage notes.
        </p>
      </div>
    );
  }

  // Show password prompt if passkey is set and password not provided
  if (showPasswordPrompt) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border p-6 ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              🔐 Unlock Notes
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your notes are password-protected. Please enter your password to access them.
            </p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Enter your notes password"
                className="w-full"
                required
                autoFocus
              />
              {passwordError && (
                <p className="text-red-600 text-sm mt-1">{passwordError}</p>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPassword('');
                  setPasswordError('');
                  // Could redirect or show different view
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!password.trim() || loading}
                className="flex-1"
              >
                {loading ? 'Unlocking...' : 'Unlock Notes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Notes Manager
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create and manage your notes with optional encryption
            </p>
            {passkeyStatus.isSet && (
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  🔐 Password Protected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPassword('');
                    setShowPasswordPrompt(true);
                  }}
                  className="ml-3 text-xs"
                >
                  Change Password
                </Button>
              </div>
            )}
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="px-6"
          >
            Create Note
          </Button>
        </div>
      </div>

      {/* Create Note Form */}
      {showCreateForm && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Create New Note
          </h3>
          
          <form onSubmit={handleCreateNote} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Note Content
              </label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Enter your note content..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                rows={4}
                required
              />
            </div>

            {/* Properties */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  X Position
                </label>
                <Input
                  type="number"
                  value={noteProperties.x}
                  onChange={(e) => setNoteProperties(prev => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Y Position
                </label>
                <Input
                  type="number"
                  value={noteProperties.y}
                  onChange={(e) => setNoteProperties(prev => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Z Position
                </label>
                <Input
                  type="number"
                  value={noteProperties.z}
                  onChange={(e) => setNoteProperties(prev => ({ ...prev, z: parseInt(e.target.value) || 0 }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <Input
                  type="color"
                  value={noteProperties.color}
                  onChange={(e) => setNoteProperties(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full h-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Height
                </label>
                <Input
                  type="number"
                  value={noteProperties.height}
                  onChange={(e) => setNoteProperties(prev => ({ ...prev, height: parseInt(e.target.value) || 100 }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Width
                </label>
                <Input
                  type="number"
                  value={noteProperties.width}
                  onChange={(e) => setNoteProperties(prev => ({ ...prev, width: parseInt(e.target.value) || 200 }))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Encryption Options */}
            {passkeyStatus.isSet && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="useEncryption"
                    checked={useEncryption}
                    onChange={(e) => setUseEncryption(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="useEncryption" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Encrypt this note
                  </label>
                </div>
                
                {useEncryption && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This note will be encrypted using your current password.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex space-x-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !noteContent.trim()}
                className="flex-1"
              >
                {isSubmitting ? 'Creating...' : 'Create Note'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Notes List */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Your Notes
          </h3>
          {notes.length > 0 && (
            <div className="text-sm text-gray-500">
              Page {currentPage} of {Math.ceil(notes.length / pageSize)}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">No notes found.</p>
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="outline"
              className="mt-3"
            >
              Create your first note
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {isNoteEncrypted(note) && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          🔒 Encrypted
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        ID: {note.id}
                      </span>
                    </div>
                    
                    <div className="text-gray-900 dark:text-white mb-2">
                      {isNoteEncrypted(note) ? (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Content is encrypted
                          </p>
                          <div className="flex space-x-2">
                            <Input
                              type="password"
                              placeholder="Enter password to decrypt"
                              className="text-sm"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleDecryptNote(note, e.target.value);
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const input = document.querySelector(`input[placeholder="Enter password to decrypt"]`);
                                if (input) {
                                  handleDecryptNote(note, input.value);
                                }
                              }}
                            >
                              Decrypt
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p>{note.content}</p>
                      )}
                    </div>
                    
                    {note.properties && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Properties:</span> x:{note.properties.x}, y:{note.properties.y}, z:{note.properties.z}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {notes.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              size="sm"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={notes.length < pageSize}
              size="sm"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesManager; 