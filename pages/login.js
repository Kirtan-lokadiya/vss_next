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

  return (
    <>
      <Head>
        <title>Log In - VSS</title>
        <meta name="description" content="Sign in to VSS" />
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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} className="text-text-secondary" />
                </button>
              </div>
              <Button type="submit" className="w-full" variant="default" loading={loading}>
                Log In
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/register" className="inline-block">
                <Button variant="success">Create new account</Button>
              </Link>
            </div>
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

export default Login;