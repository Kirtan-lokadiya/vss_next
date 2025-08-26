import React from 'react';
import { useRouter } from 'next/router';
import Button from '../src/components/ui/Button';
import Icon from '../src/components/AppIcon';

const VerifyEmail = () => {
  const router = useRouter();
  const { email } = router.query;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-200 flex">
      {/* Left Section - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center px-12">
        <div className="relative">
          {/* Simple illustration placeholder */}
          <div className="w-80 h-80 bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl flex items-center justify-center">
            <div className="text-white text-6xl">
              <Icon name="Mail" size={120} />
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              VSS
            </h1>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Mail" size={40} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Great, now verify your email
              </h2>
            </div>

            <div className="space-y-4 text-gray-600">
              <p>
                Check your inbox at <span className="font-medium text-gray-900">{email || 'your email'}</span> and 
                click the verification link inside to complete your registration. 
                This link will expire shortly, so verify soon!
              </p>
              
              <p className="text-sm">
                <span className="font-medium">Don't see an email?</span> Check your spam folder.
              </p>
            </div>

            <div className="mt-8">
              <Button
                onClick={() => router.push('/login')}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-base"
              >
                Continue to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;