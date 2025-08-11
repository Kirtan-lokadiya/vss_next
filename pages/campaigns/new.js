import React, { useState } from 'react';
import Head from 'next/head';
import Header from '@/src/components/ui/Header';
import NavigationBreadcrumb from '@/src/components/ui/NavigationBreadcrumb';
import Input from '@/src/components/ui/Input';
import Button from '@/src/components/ui/Button';

const NewCampaignPage = () => {
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (!title.trim()) return;
    alert('Demo: Campaign created (dummy). Funds are kept even if goal is not met.');
    setTitle('');
    setGoal('');
    setDescription('');
  };

  return (
    <>
      <Head>
        <title>Create Campaign - LinkedBoard Pro</title>
      </Head>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <div className="px-6 py-4 border-b border-border">
            <NavigationBreadcrumb customBreadcrumbs={[{ label: 'Home', path: '/', icon: 'Home' }, { label: 'Create Campaign', path: '/campaigns/new', icon: 'Megaphone', current: true }]} />
          </div>
          <div className="max-w-2xl mx-auto px-4 lg:px-6 py-6">
            <div className="bg-card border border-border rounded-lg shadow-card p-6 space-y-4">
              <h1 className="text-xl font-semibold text-foreground">Start a new campaign</h1>
              <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Campaign title" />
              <Input label="Goal (optional)" type="number" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. 500" />
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="w-full border border-border rounded-lg px-3 py-2" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your campaign..." />
              </div>
              <div className="flex justify-end">
                <Button variant="default" iconName="Megaphone" iconPosition="left" onClick={handleCreate}>Create</Button>
              </div>
              <p className="text-xs text-text-secondary">Demo only. Funds are kept even if the goal is not met.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewCampaignPage; 