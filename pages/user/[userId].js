import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../src/components/ui/Header';
import Icon from '../../src/components/AppIcon';
import { fetchUserBasic, fetchUserProfile, getAuthToken } from '../../src/utils/api';

const UserProfile = () => {
  const router = useRouter();
  const { userId } = router.query;
  const [userBasic, setUserBasic] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    
    const loadUserData = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        const [basic, profile] = await Promise.all([
          fetchUserBasic({ userId, token }),
          fetchUserProfile({ userId, token })
        ]);
        setUserBasic(basic);
        setUserProfile(profile);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">Failed to load profile</p>
            <p className="text-text-secondary text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{userBasic?.name || 'User'} - Profile</title>
      </Head>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-12 flex justify-center">
          <div className="bg-card border border-border rounded-lg shadow-card p-8 w-full max-w-2xl">
            <div className="flex flex-col items-center mb-6">
              <div className="w-28 h-28 rounded-full bg-primary flex items-center justify-center overflow-hidden mb-4">
                {userBasic?.picture && userBasic.picture !== 'NONE' ? (
                  <img src={userBasic.picture} alt="Avatar" className="w-28 h-28 rounded-full object-cover" />
                ) : (
                  <span className="text-white font-semibold text-4xl">
                    {userBasic?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2">{userBasic?.name || 'User'}</h2>
              <p className="text-text-secondary mb-2">{userBasic?.email || ''}</p>
            </div>

            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border rounded-lg p-4 bg-background">
                <label className="block text-sm font-medium mb-1">Gender</label>
                <p className="text-text-secondary">{userProfile?.gender || '-'}</p>
              </div>
              <div className="border border-border rounded-lg p-4 bg-background">
                <label className="block text-sm font-medium mb-1">Birthday</label>
                <p className="text-text-secondary">{userProfile?.birthday || '-'}</p>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border rounded-lg p-4 bg-background">
                <label className="block text-sm font-medium mb-1">Location</label>
                <p className="text-text-secondary">{userProfile?.location || '-'}</p>
              </div>
              <div className="border border-border rounded-lg p-4 bg-background">
                <label className="block text-sm font-medium mb-1">LinkedIn</label>
                {userProfile?.linkedin ? (
                  <a href={userProfile.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-words">
                    {userProfile.linkedin}
                  </a>
                ) : (
                  <p className="text-text-secondary">-</p>
                )}
              </div>
            </div>

            <div className="mb-6 border border-border rounded-lg p-4 bg-background">
              <label className="block text-sm font-medium mb-1">Twitter</label>
              {userProfile?.twitter ? (
                <a href={userProfile.twitter} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-words">
                  {userProfile.twitter}
                </a>
              ) : (
                <p className="text-text-secondary">-</p>
              )}
            </div>

            {userProfile?.education && (
              <div className="mb-6 border border-border rounded-lg p-4 bg-background">
                <label className="block text-sm font-medium mb-2">Education</label>
                <div className="space-y-4">
                  {userProfile.education.map((edu, idx) => (
                    <div key={idx}>
                      <div className="text-foreground font-medium">{edu.degree || '-'} @ {edu.place || '-'}</div>
                      <div className="text-sm text-text-secondary">{edu.startingDate || '-'} to {edu.endingDate || '-'}</div>
                      {edu.info && <div className="text-sm mt-1">{edu.info}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {userProfile?.work && (
              <div className="mb-6 border border-border rounded-lg p-4 bg-background">
                <label className="block text-sm font-medium mb-2">Work</label>
                <div className="space-y-4">
                  {userProfile.work.map((job, idx) => (
                    <div key={idx}>
                      <div className="text-foreground font-medium">{job.role || '-'} @ {job.company || '-'}</div>
                      <div className="text-sm text-text-secondary">{job.joiningDate || '-'} to {job.exitingDate || 'Present'}</div>
                      {job.workNote && <div className="text-sm mt-1">{job.workNote}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;