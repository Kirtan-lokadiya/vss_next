import React from 'react';
import { useRouter } from 'next/router';
import Icon from '../src/components/AppIcon';

const VerifyEmail = () => {
  const router = useRouter();
  const { email } = router.query;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Logo */}
        <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-8">
          VSS
        </h1>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Great, now verify your email
        </h2>

        {/* Email Icon */}
        <div className="mb-8 flex justify-center">
       
        </div>

        {/* Content */}
        <div className="space-y-4 text-gray-600 mb-8">
          <p>
            Check your inbox at <span className="font-medium text-gray-900">{email || 'work.it.temp@gmail.com'}</span> and 
            click the verification link inside to complete your registration. 
            This link will expire shortly, so verify soon!
          </p>
          
          <p className="text-sm">
            <span className="font-medium">Don't see an email?</span> Check your spam folder.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;