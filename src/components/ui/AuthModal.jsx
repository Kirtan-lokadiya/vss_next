import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Icon from '../AppIcon';
import Input from './Input';
import Button from './Button';
import { useAuth } from '../../context/AuthContext';

const AuthModal = () => {
  const { authModalOpen, closeAuthModal, login, register, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  if (!authModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(loginData.email, loginData.password);
    if (!res.success) {
      setError(res.message || 'Login failed');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const res = await register(registerData);
    if (!res.success) {
      setError(res.message || 'Registration failed');
    }
  };

  const overlay = (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-1020 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-modal w-full max-w-md p-6 relative space-y-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={closeAuthModal}
          className="absolute top-2 right-2"
        >
          <Icon name="X" size={18} />
        </Button>

        {/* Tabs */}
        <div className="flex justify-center space-x-6 mb-2">
          <button
            className={`pb-2 border-b-2 font-medium ${activeTab === 'login' ? 'border-primary text-primary' : 'border-transparent text-text-secondary'}`}
            onClick={() => setActiveTab('login')}
          >
            Sign In
          </button>
          <button
            className={`pb-2 border-b-2 font-medium ${activeTab === 'register' ? 'border-primary text-primary' : 'border-transparent text-text-secondary'}`}
            onClick={() => setActiveTab('register')}
          >
            Sign Up
          </button>
        </div>

        {error && <p className="text-sm text-error text-center">{error}</p>}

        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} className="text-text-secondary" />
                </button>
              </div>
            </div>
            <Button type="submit" variant="default" className="w-full" loading={loading}>Sign In</Button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <Input
                  type="text"
                  value={registerData.firstName}
                  onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <Input
                  type="text"
                  value={registerData.lastName}
                  onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} className="text-text-secondary" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={16} className="text-text-secondary" />
                </button>
              </div>
            </div>
            <Button type="submit" variant="default" className="w-full" loading={loading}>Create Account</Button>
          </form>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(overlay, document.body);
};

export default AuthModal;