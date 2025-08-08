import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Icon from '../src/components/AppIcon';
import Input from '../src/components/ui/Input';
import Button from '../src/components/ui/Button';
import { useAuth } from "../src/context/AuthContext";

const Login = () => {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(formData.email, formData.password);
  };

  const handleGoogleSignIn = async () => {
    // TODO: Handle Google OAuth
  };

  return (
    <>
      <Head>
        <title>Login - LinkedBoard Pro</title>
        <meta name="description" content="Sign in to your LinkedBoard Pro account" />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
        <div className="bg-card p-8 rounded-lg shadow-card w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Sign in to your LinkedBoard Pro account
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center space-x-2 border border-border rounded-lg py-2.5 hover:bg-muted transition-micro"
          >
            <svg width="20" height="20" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.72 1.22 9.22 3.23l6.9-6.9C36.68 2.36 30.74 0 24 0 14.82 0 6.71 5.06 2.69 12.44l8.06 6.26C12.36 13.13 17.74 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.22-.42-4.74H24v9.04h12.42c-.54 2.9-2.18 5.36-4.64 7.04l7.18 5.6C43.98 37.1 46.1 31.3 46.1 24.5z"/><path fill="#FBBC05" d="M10.75 28.7c-1.1-3.3-1.1-6.8 0-10.1l-8.06-6.26C.98 16.1 0 20.01 0 24c0 3.99.98 7.9 2.69 11.66l8.06-6.26z"/><path fill="#EA4335" d="M24 48c6.48 0 11.92-2.14 15.89-5.82l-7.18-5.6c-2.01 1.35-4.59 2.15-8.71 2.15-6.26 0-11.64-3.63-13.25-8.86l-8.06 6.26C6.71 42.94 14.82 48 24 48z"/></g></svg>
            <span>Sign in with Google</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-text-secondary">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} className="text-text-secondary" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary border-border rounded"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-text-secondary">
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" variant="default" loading={loading}>
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;