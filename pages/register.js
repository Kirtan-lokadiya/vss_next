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
    await register({ firstName: formData.firstName, lastName: formData.lastName, email: formData.email, password: formData.password });
  };

  return (
    <>
      <Head>
        <title>Sign Up - VSS</title>
        <meta name="description" content="Create your VSS account" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-[#F3F0FF] dark:bg-background py-12 px-4">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left brand panel */}
          <div className="hidden md:block">
            <div className="space-y-6">
              <h1 className="text-6xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">VSS</span>
              </h1>
              <p className="text-lg text-text-secondary max-w-md">
                VSS helps you connect and share with the people in your life.
              </p>
            </div>
          </div>

          {/* Right form card */}
          <div className="bg-white dark:bg-card p-8 rounded-xl shadow-card w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Full Name"
                required
              />
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email address"
                required
              />
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} className="text-text-secondary" />
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                  required
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={16} className="text-text-secondary" />
                </button>
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
                  I agree to the Terms of Service and Privacy Policy
                </label>
              </div>

              <Button type="submit" className="w-full" variant="default" loading={loading}>
                Sign Up
              </Button>
            </form>

            <p className="text-center text-sm text-text-secondary mt-4">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>

          {/* Bottom helper text on small screens */}
          <div className="md:col-span-2 text-center text-xs text-text-secondary mt-8">
            Create a Profile for a Showcase Creativity and Connect People.
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;