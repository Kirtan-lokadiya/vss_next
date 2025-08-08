import React, { useState } from 'react';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';

const CollaborationPanel = ({ 
  isVisible, 
  onClose, 
  collaborators, 
  onInviteUser, 
  onRemoveUser,
  currentUser 
}) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');

  if (!isVisible) return null;

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      onInviteUser({
        email: inviteEmail.trim(),
        role: inviteRole,
        status: 'pending'
      });
      setInviteEmail('');
    }
  };

  const getRoleColor = (role) => {
    const roleColors = {
      owner: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800',
      editor: 'bg-blue-100 text-blue-800',
      viewer: 'bg-gray-100 text-gray-800'
    };
    return roleColors[role] || roleColors.viewer;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      offline: 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || statusColors.offline;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1020">
      <div className="bg-white rounded-lg shadow-modal w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Collaboration</h2>
            <p className="text-sm text-text-secondary mt-1">
              Manage who can access and edit this whiteboard
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Invite Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-foreground mb-4">Invite People</h3>
            <div className="flex space-x-3">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter email address..."
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <Button
                variant="default"
                onClick={handleInvite}
                disabled={!inviteEmail.trim()}
              >
                <Icon name="UserPlus" size={16} className="mr-1" />
                Invite
              </Button>
            </div>
            <p className="text-xs text-text-secondary mt-2">
              Invited users will receive an email with access to this whiteboard
            </p>
          </div>

          {/* Current Collaborators */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">
              Current Collaborators ({collaborators.length})
            </h3>
            <div className="space-y-3">
              {collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <Icon name="User" size={20} color="white" />
                      </div>
                      {collaborator.status === 'active' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {collaborator.name}
                        {collaborator.id === currentUser.id && (
                          <span className="text-text-secondary ml-1">(You)</span>
                        )}
                      </p>
                      <p className="text-xs text-text-secondary">{collaborator.email}</p>
                      {collaborator.lastActive && (
                        <p className="text-xs text-text-secondary">
                          Last active: {new Date(collaborator.lastActive).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(collaborator.role)}`}>
                      {collaborator.role}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(collaborator.status)}`}>
                      {collaborator.status}
                    </span>
                    
                    {collaborator.id !== currentUser.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveUser(collaborator.id)}
                        className="w-8 h-8 text-destructive hover:text-destructive"
                        title="Remove user"
                      >
                        <Icon name="UserMinus" size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Permissions Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Permission Levels</h4>
            <div className="space-y-1 text-xs text-blue-800">
              <div><strong>Viewer:</strong> Can view the whiteboard but cannot edit</div>
              <div><strong>Editor:</strong> Can create, edit, and delete notes</div>
              <div><strong>Admin:</strong> Can manage collaborators and board settings</div>
              <div><strong>Owner:</strong> Full control including deletion of the board</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-text-secondary">
            <Icon name="Shield" size={16} />
            <span>All collaborators are notified of changes in real-time</span>
          </div>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CollaborationPanel;