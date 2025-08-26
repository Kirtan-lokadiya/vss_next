import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from './Button';
import Input from './Input';
import Icon from '../AppIcon';

const VSSAuthForm = ({ mode = 'login' }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, register } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        // Registration
        if (formData.password !== formData.confirmPassword) {
          showToast('Passwords do not match', 'error');
          return;
        }

        const result = await register({
          firstName: formData.fullName.split(' ')[0] || formData.fullName,
          lastName: formData.fullName.split(' ').slice(1).join(' ') || '',
          email: formData.email,
          password: formData.password
        });

        if (result.success) {
          showToast('Registration successful! Please check your email for verification.', 'success');
          // Reset form
          setFormData({
            fullName: '',
            email: '',
            password: '',
            confirmPassword: ''
          });
          setShowPassword(false);
          setShowConfirmPassword(false);
        } else {
          showToast(result.message || 'Registration failed', 'error');
        }
      } else {
        // Login
        const result = await login(formData.email, formData.password);
        if (result.success) {
          showToast('Login successful!', 'success');
        } else {
          showToast(result.message || 'Login failed', 'error');
        }
      }
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
      console.error('Auth error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToOppositePage = () => {
    setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
    if (mode === 'login') {
      router.push('/register');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200 flex">
      {/* Left Section - Branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center px-12">
        <div className="text-center">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            VSS
          </h1>
          <p className="text-gray-700 text-lg max-w-md">
            with VSS provide Open-funding to your DREAM And connect with people with similar thought
          </p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Mobile Logo for small screens */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                VSS
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'register' && (
                <div>
                  <Input
                    name="fullName"
                    type="text"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full h-12 text-base border border-gray-300 rounded-lg px-3"
                  />
                </div>
              )}

              <div>
                <Input
                  name="email"
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full h-12 text-base border border-gray-300 rounded-lg px-3"
                />
              </div>

              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full h-12 text-base border border-gray-300 rounded-lg px-3 pr-10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-2 flex items-center px-2 text-gray-500 hover:text-gray-700"
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
                </button>
              </div>

              {mode === 'register' && (
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full h-12 text-base border border-gray-300 rounded-lg px-3 pr-10"
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    onClick={() => setShowConfirmPassword(v => !v)}
                    className="absolute inset-y-0 right-2 flex items-center px-2 text-gray-500 hover:text-gray-700"
                  >
                    <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={18} />
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {mode === 'login' ? (
                  <>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-base"
                    >
                      {isSubmitting ? 'Logging In...' : 'Log In'}
                    </Button>
                    <Button
                      type="button"
                      onClick={goToOppositePage}
                      className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-base"
                    >
                      Create new account
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-base"
                    >
                      {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={goToOppositePage}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Already have an account? Log in
                      </button>
                    </div>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <p className="text-gray-600 text-sm text-center">
          Create a profile to showcase your creativity.
        </p>
      </div>
    </div>
  );
};

export default VSSAuthForm;
