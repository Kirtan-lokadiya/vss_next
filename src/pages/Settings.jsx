import React, { useState } from 'react';
import Header from '@/src/components/ui/Header';
import Button from '@/src/components/ui/Button';

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [newsletter, setNewsletter] = useState(false);
  const [theme, setTheme] = useState('system');

  const handleSave = () => {
    // Save settings (UI only)
    alert('Settings saved!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex flex-col items-center justify-center pt-24 pb-12">
        <div className="bg-card border border-border rounded-lg shadow-card p-8 w-full max-w-lg">
          <h2 className="text-2xl font-bold mb-6">Settings</h2>
          <div className="mb-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={notifications}
                onChange={e => setNotifications(e.target.checked)}
                className="form-checkbox h-5 w-5 text-primary bg-background border-border dark:bg-background dark:border-border"
              />
              <span className="text-sm">Enable notifications</span>
            </label>
          </div>
          <div className="mb-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={newsletter}
                onChange={e => setNewsletter(e.target.checked)}
                className="form-checkbox h-5 w-5 text-primary bg-background border-border dark:bg-background dark:border-border"
              />
              <span className="text-sm">Subscribe to newsletter</span>
            </label>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Theme</label>
            <select
              value={theme}
              onChange={e => setTheme(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 bg-background text-foreground dark:bg-background dark:text-foreground"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div className="flex justify-end">
            <Button variant="default" onClick={handleSave}>Save Settings</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
