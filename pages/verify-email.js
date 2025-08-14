import React, { useEffect } from 'react';
import { useToast } from '../src/context/ToastContext';

const VerifyEmailPage = () => {
  const { showToast } = useToast();
  useEffect(() => {
    showToast('Please check your email for a verification link.');
  }, [showToast]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Check Your Email</h1>
      <p className="text-lg text-foreground mb-2">Thank you for registering!</p>
      <p className="text-foreground">We have sent a verification link to your email address. Please check your inbox and click the link to verify your account.</p>
    </div>
  );
};

export default VerifyEmailPage;
