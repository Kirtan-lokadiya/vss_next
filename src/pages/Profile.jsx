import React, { useEffect, useMemo, useState, useRef } from 'react';
import Header from '@/src/components/ui/Header';
import Icon from '@/src/components/AppIcon';
import Button from '@/src/components/ui/Button';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/context/ToastContext';
import { extractUserId } from '@/src/utils/jwt';
import { fetchUserBasic, fetchUserProfile, updateUserProfile } from '@/src/utils/api';

const USER_BASIC_CACHE_KEY = 'user_basic_v1';

const emptyProfile = {
  gender: '',
  birthday: '',
  location: '',
  linkedin: '',
  twitter: '',
  education: [],
  work: [],
};

const Profile = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const userId = useMemo(() => extractUserId(token), [token]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [userBasic, setUserBasic] = useState({ name: '', email: '', picture: null });
  const [profile, setProfile] = useState(emptyProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(emptyProfile);

  // Guard to avoid duplicate fetches under StrictMode
  const lastFetchKeyRef = useRef(null);

  useEffect(() => {
    const key = `${userId}|${!!token}`;
    if (!token || !userId) {
      setLoading(false);
      return;
    }
    if (lastFetchKeyRef.current === key) {
      return; // already fetched for this key
    }
    lastFetchKeyRef.current = key;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try basic from session cache first
        try {
          const cached = typeof window !== 'undefined' ? sessionStorage.getItem(USER_BASIC_CACHE_KEY) : null;
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.userId === userId && parsed.name) {
              setUserBasic(prev => ({ ...prev, name: parsed.name }));
            }
          }
        } catch {}

        const [basic, prof] = await Promise.all([
          fetchUserBasic({ userId, token }),
          fetchUserProfile({ userId, token })
        ]);

        setUserBasic({
          name: basic?.name || '',
          email: basic?.email || '',
          picture: basic?.picture && basic.picture !== 'None' ? basic.picture : null,
        });
        try {
          sessionStorage.setItem(USER_BASIC_CACHE_KEY, JSON.stringify({ userId, name: basic?.name || '' }));
        } catch {}
        const normalized = {
          gender: prof?.gender || '',
          birthday: prof?.birthday || '',
          location: prof?.location || '',
          linkedin: prof?.linkedin || '',
          twitter: prof?.twitter || '',
          education: Array.isArray(prof?.education) ? prof.education : [],
          work: Array.isArray(prof?.work) ? prof.work : [],
        };
        setProfile(normalized);
        setEditData(normalized);
      } catch (err) {
        console.error(err);
        setError(err?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token, userId]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const payload = {
        gender: editData.gender || null,
        birthday: editData.birthday || null,
        location: editData.location || null,
        linkedin: editData.linkedin || null,
        twitter: editData.twitter || null,
        education: editData.education && editData.education.length ? editData.education : null,
        work: editData.work && editData.work.length ? editData.work : null,
      };
      await updateUserProfile({ profile: payload, token });
      setProfile(editData);
      setIsEditing(false);
      showToast('Profile updated');
    } catch (err) {
      console.error(err);
      showToast(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const updateEducationItem = (index, key, value) => {
    const next = [...(editData.education || [])];
    next[index] = { ...(next[index] || {}), [key]: value };
    setEditData({ ...editData, education: next });
  };

  const addEducationItem = () => {
    setEditData({
      ...editData,
      education: [
        ...(editData.education || []),
        { place: '', degree: '', startingDate: '', endingDate: '', info: '' }
      ]
    });
  };

  const removeEducationItem = (index) => {
    const next = [...(editData.education || [])];
    next.splice(index, 1);
    setEditData({ ...editData, education: next });
  };

  const updateWorkItem = (index, key, value) => {
    const next = [...(editData.work || [])];
    next[index] = { ...(next[index] || {}), [key]: value };
    setEditData({ ...editData, work: next });
  };

  const addWorkItem = () => {
    setEditData({
      ...editData,
      work: [
        ...(editData.work || []),
        { company: '', role: '', joiningDate: '', exitingDate: null, workNote: '' }
      ]
    });
  };

  const removeWorkItem = (index) => {
    const next = [...(editData.work || [])];
    next.splice(index, 1);
    setEditData({ ...editData, work: next });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex flex-col items-center justify-center pt-24 pb-12">
        <div className="bg-card border border-border rounded-lg shadow-card p-8 w-full max-w-2xl">
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-28 h-28 mb-4">
              <div className="w-28 h-28 rounded-full bg-primary flex items-center justify-center overflow-hidden">
                {userBasic.picture ? (
                  <img src={userBasic.picture} alt="Avatar" className="w-28 h-28 rounded-full object-cover" />
                ) : (
                  <Icon name="User" size={56} color="white" />
                )}
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">{userBasic.name || 'User'}</h2>
            <p className="text-text-secondary mb-2">{userBasic.email || ''}</p>
          </div>

          {error && (
            <div className="mb-4 text-sm text-error">{error}</div>
          )}

          {/* Basic info */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-border rounded-lg p-4 bg-background">
              <label className="block text-sm font-medium mb-1">Gender</label>
              <p className="text-text-secondary">{profile.gender || '-'}</p>
            </div>
            <div className="border border-border rounded-lg p-4 bg-background">
              <label className="block text-sm font-medium mb-1">Birthday</label>
              <p className="text-text-secondary">{profile.birthday || '-'}</p>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-border rounded-lg p-4 bg-background">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">Location</label>
              </div>
              <p className="text-text-secondary">{profile.location || '-'}</p>
            </div>
            <div className="border border-border rounded-lg p-4 bg-background">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">LinkedIn</label>
                {!isEditing && !profile.linkedin && (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>Add</Button>
                )}
              </div>
              {isEditing ? (
                <input
                  type="url"
                  value={editData.linkedin || ''}
                  onChange={e => setEditData({ ...editData, linkedin: e.target.value })}
                  placeholder="https://www.linkedin.com/in/username"
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground"
                />
              ) : (
                profile.linkedin ? (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-words">{profile.linkedin}</a>
                ) : (
                  <p className="text-text-secondary">-</p>
                )
              )}
            </div>
          </div>

          <div className="mb-6 border border-border rounded-lg p-4 bg-background">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">Twitter</label>
              {!isEditing && !profile.twitter && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>Add</Button>
              )}
            </div>
            {isEditing ? (
              <input
                type="url"
                value={editData.twitter || ''}
                onChange={e => setEditData({ ...editData, twitter: e.target.value })}
                placeholder="https://twitter.com/username"
                className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground"
              />
            ) : (
              profile.twitter ? (
                <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-words">{profile.twitter}</a>
              ) : (
                <p className="text-text-secondary">-</p>
              )
            )}
          </div>

          {/* Education */}
          <div className="mb-6 border border-border rounded-lg p-4 bg-background">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Education</label>
              {isEditing && (
                <Button variant="ghost" onClick={addEducationItem}>+ Add</Button>
              )}
            </div>
            {(isEditing ? editData.education : profile.education)?.length ? (
              <div className="space-y-4">
                {(isEditing ? editData.education : profile.education).map((edu, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {isEditing ? (
                      <>
                        <input type="text" value={edu.place || ''} onChange={e => updateEducationItem(idx, 'place', e.target.value)} placeholder="Place" className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground" />
                        <input type="text" value={edu.degree || ''} onChange={e => updateEducationItem(idx, 'degree', e.target.value)} placeholder="Degree" className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground" />
                        <input type="date" value={edu.startingDate || ''} onChange={e => updateEducationItem(idx, 'startingDate', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground" />
                        <input type="date" value={edu.endingDate || ''} onChange={e => updateEducationItem(idx, 'endingDate', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground" />
                        <input type="text" value={edu.info || ''} onChange={e => updateEducationItem(idx, 'info', e.target.value)} placeholder="Notes" className="w-full md:col-span-2 border border-border rounded-lg px-3 py-2 bg-background text-foreground" />
                        <div className="md:col-span-2 flex justify-end">
                          <Button variant="ghost" onClick={() => removeEducationItem(idx)}>Remove</Button>
                        </div>
                      </>
                    ) : (
                      <div className="md:col-span-2">
                        <div className="text-foreground font-medium">{edu.degree || '-'} @ {edu.place || '-'}</div>
                        <div className="text-sm text-text-secondary">{edu.startingDate || '-'} to {edu.endingDate || '-'}</div>
                        {edu.info ? <div className="text-sm mt-1">{edu.info}</div> : null}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary">{isEditing ? 'No education entries. Add one.' : 'No education added.'}</p>
            )}
          </div>

          {/* Work */}
          <div className="mb-6 border border-border rounded-lg p-4 bg-background">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Work</label>
              {isEditing && (
                <Button variant="ghost" onClick={addWorkItem}>+ Add</Button>
              )}
            </div>
            {(isEditing ? editData.work : profile.work)?.length ? (
              <div className="space-y-4">
                {(isEditing ? editData.work : profile.work).map((job, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {isEditing ? (
                      <>
                        <input type="text" value={job.company || ''} onChange={e => updateWorkItem(idx, 'company', e.target.value)} placeholder="Company" className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground" />
                        <input type="text" value={job.role || ''} onChange={e => updateWorkItem(idx, 'role', e.target.value)} placeholder="Role" className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground" />
                        <input type="date" value={job.joiningDate || ''} onChange={e => updateWorkItem(idx, 'joiningDate', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground" />
                        <input type="date" value={job.exitingDate || ''} onChange={e => updateWorkItem(idx, 'exitingDate', e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground" />
                        <input type="text" value={job.workNote || ''} onChange={e => updateWorkItem(idx, 'workNote', e.target.value)} placeholder="Notes" className="w-full md:col-span-2 border border-border rounded-lg px-3 py-2 bg-background text-foreground" />
                        <div className="md:col-span-2 flex justify-end">
                          <Button variant="ghost" onClick={() => removeWorkItem(idx)}>Remove</Button>
                        </div>
                      </>
                    ) : (
                      <div className="md:col-span-2">
                        <div className="text-foreground font-medium">{job.role || '-'} @ {job.company || '-'}</div>
                        <div className="text-sm text-text-secondary">{job.joiningDate || '-'} to {job.exitingDate || 'Present'}</div>
                        {job.workNote ? <div className="text-sm mt-1">{job.workNote}</div> : null}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary">{isEditing ? 'No work entries. Add one.' : 'No work added.'}</p>
            )}
          </div>

          {/* Edit/Save Buttons */}
          <div className="flex justify-end space-x-2">
            {isEditing ? (
              <>
                <Button variant="ghost" onClick={() => { setIsEditing(false); setEditData(profile); }}>Cancel</Button>
                <Button variant="default" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
              </>
            ) : (
              <Button variant="default" onClick={() => setIsEditing(true)} disabled={loading || !!error}>
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
