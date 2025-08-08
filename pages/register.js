import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Icon from '../src/components/AppIcon';
import Input from '../src/components/ui/Input';
import Button from '../src/components/ui/Button';
import { useAuth } from "../src/context/AuthContext";

const Register = () => {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (!agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }
    await register(formData.firstName, formData.lastName, formData.email, formData.password);
  };

  const handleGoogleSignUp = async () => {
    // TODO: Handle Google OAuth
  };

  return (
    <>
      <Head>
        <title>Register - LinkedBoard Pro</title>
        <meta name="description" content="Create your LinkedBoard Pro account" />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
        <div className="bg-card p-8 rounded-lg shadow-card w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Join LinkedBoard Pro and start networking
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center space-x-2 border border-border rounded-lg py-2.5 hover:bg-muted transition-micro"
          >
            <svg width="20" height="20" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.72 1.22 9.22 3.23l6.9-6.9C36.68 2.36 30.74 0 24 0 14.82 0 6.71 5.06 2.69 12.44l8.06 6.26C12.36 13.13 17.74 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.22-.42-4.74H24v9.04h12.42c-.54 2.9-2.18 5.36-4.64 7.04l7.18 5.6C43.98 37.1 46.1 31.3 46.1 24.5z"/><path fill="#FBBC05" d="M10.75 28.7c-1.1-3.3-1.1-6.8 0-10.1l-8.06-6.26C.98 16.1 0 20.01 0 24c0 3.99.98 7.9 2.69 11.66l8.06-6.26z"/><path fill="#EA4335" d="M24 48c6.48 0 11.92-2.14 15.89-5.82l-7.18-5.6c-2.01 1.35-4.59 2.15-8.71 2.15-6.26 0-11.64-3.63-13.25-8.86l-8.06 6.26C6.71 42.94 14.82 48 24 48z"/></g></svg>
            <span>Sign up with Google</span>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

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
                  placeholder="Create a password"
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

            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={16} className="text-text-secondary" />
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="agree-terms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="h-4 w-4 text-primary border-border rounded"
              />
              <label htmlFor="agree-terms" className="ml-2 text-sm text-text-secondary">
                I agree to the{' '}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button type="submit" className="w-full" variant="default" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;