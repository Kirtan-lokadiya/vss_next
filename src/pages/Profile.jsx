import React, { useState } from 'react';
import Header from '@/src/components/ui/Header';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';

const mockProfile = {
  name: 'John Doe',
  email: 'john.doe@email.com',
  avatar: null,
  bio: 'Product manager passionate about innovation and collaboration.',
  location: 'San Francisco, CA',
  website: 'https://johndoe.com',
  linkedin: 'in/johndoe',
  twitter: '@johndoe',
  stats: {
    posts: 24,
    ideas: 32,
    connections: 156,
  },
  activity: [
    { type: 'post', text: 'Shared a new post about product strategy', time: '2h ago' },
    { type: 'idea', text: 'Created an idea: "AI-powered feedback"', time: '1d ago' },
    { type: 'connection', text: 'Connected with Sarah Johnson', time: '3d ago' },
  ]
};

const Profile = () => {
  const [profile, setProfile] = useState(mockProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(profile);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleSave = () => {
    setProfile({ ...editData, avatar: avatarPreview || profile.avatar });
    setIsEditing(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex flex-col items-center justify-center pt-24 pb-12">
        <div className="bg-card border border-border rounded-lg shadow-card p-8 w-full max-w-2xl">
          {/* Avatar and Name */}
          <div className="flex flex-col items-center mb-6">
          <div className="relative w-28 h-28 mb-4">
            <div className="w-28 h-28 rounded-full bg-primary flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-28 h-28 rounded-full object-cover" />
              ) : profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-28 h-28 rounded-full object-cover" />
              ) : (
                <Icon name="User" size={56} color="white" />
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer shadow-lg">
                <Icon name="Camera" size={16} />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            )}
          </div>
          {isEditing ? (
            <input
              type="text"
              value={editData.name}
              onChange={e => setEditData({ ...editData, name: e.target.value })}
              className="text-xl font-bold text-center mb-2 border-b border-border focus:outline-none focus:border-primary bg-background text-foreground dark:bg-background dark:text-foreground"
            />
          ) : (
            <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
          )}
          <p className="text-text-secondary mb-2">{profile.email}</p>
        </div>
        {/* Stats */}
        <div className="flex justify-center space-x-8 mb-6">
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{profile.stats.posts}</div>
            <div className="text-xs text-text-secondary">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{profile.stats.ideas}</div>
            <div className="text-xs text-text-secondary">Ideas</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{profile.stats.connections}</div>
            <div className="text-xs text-text-secondary">Connections</div>
          </div>
        </div>
        {/* Bio & Location & Social Links - Always in boxes */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bio */}
          <div className="border border-border rounded-lg p-4 bg-background">
            <label className="block text-sm font-medium mb-1">Bio</label>
            {isEditing ? (
              <textarea
                value={editData.bio}
                onChange={e => setEditData({ ...editData, bio: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground dark:bg-background dark:text-foreground"
              />
            ) : (
              <p className="text-text-secondary">{profile.bio}</p>
            )}
          </div>
          {/* Location */}
          <div className="border border-border rounded-lg p-4 bg-background">
            <label className="block text-sm font-medium mb-1">Location</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.location}
                onChange={e => setEditData({ ...editData, location: e.target.value })}
                className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground dark:bg-background dark:text-foreground"
              />
            ) : (
              <p className="text-text-secondary">{profile.location}</p>
            )}
          </div>
        </div>
        {/* Social Links - Always in box */}
        <div className="mb-6 border border-border rounded-lg p-4 bg-background">
          <label className="block text-sm font-medium mb-1">Social Links</label>
          <div className="flex flex-col space-y-2">
            {isEditing ? (
              <>
                <input
                  type="url"
                  value={editData.website}
                  onChange={e => setEditData({ ...editData, website: e.target.value })}
                  placeholder="Website"
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground dark:bg-background dark:text-foreground"
                />
                <input
                  type="text"
                  value={editData.linkedin}
                  onChange={e => setEditData({ ...editData, linkedin: e.target.value })}
                  placeholder="LinkedIn"
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground dark:bg-background dark:text-foreground"
                />
                <input
                  type="text"
                  value={editData.twitter}
                  onChange={e => setEditData({ ...editData, twitter: e.target.value })}
                  placeholder="Twitter"
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground dark:bg-background dark:text-foreground"
                />
              </>
            ) : (
              <div className="flex flex-col space-y-1">
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-primary hover:underline">
                  <Icon name="Globe" size={16} />
                  <span>{profile.website}</span>
                </a>
                <a href={`https://linkedin.com/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-primary hover:underline">
                  <Icon name="Linkedin" size={16} />
                  <span>{profile.linkedin}</span>
                </a>
                <a href={`https://twitter.com/${profile.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-primary hover:underline">
                  <Icon name="Twitter" size={16} />
                  <span>{profile.twitter}</span>
                </a>
              </div>
            )}
          </div>
        </div>
        {/* Activity Feed */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Recent Activity</label>
          <div className="space-y-2">
            {profile.activity.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-sm text-text-secondary">
                <Icon name={item.type === 'post' ? 'FileText' : item.type === 'idea' ? 'Lightbulb' : 'UserPlus'} size={14} />
                <span>{item.text}</span>
                <span className="ml-auto text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Edit/Save Buttons */}
        <div className="flex justify-end space-x-2">
          {isEditing ? (
            <>
              <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button variant="default" onClick={handleSave}>Save</Button>
            </>
          ) : (
            <Button variant="default" onClick={() => setIsEditing(true)}>
              <Icon name="Edit2" size={16} className="mr-1" />Edit Profile
            </Button>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
