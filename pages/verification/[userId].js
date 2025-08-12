import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';

const VerifyPage = () => {
  const router = useRouter();
  const { verifyEmailToken } = useAuth();
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const token = router.query.token;
    if (!token) return;
    (async () => {
      const res = await verifyEmailToken(String(token));
      if (res.success) {
        setMessage('Email verified! Redirecting...');
        router.replace('/');
      } else {
        setMessage(res.message || 'Verification failed.');
      }
    })();
  }, [router.query.token, verifyEmailToken, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-foreground">{message}</p>
    </div>
  );
};

export default VerifyPage;