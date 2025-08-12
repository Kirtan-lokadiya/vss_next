import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function VerifyEmailInstructions() {
  const router = useRouter();
  const email = typeof router.query.email === 'string' ? router.query.email : '';

  return (
    <>
      <Head>
        <title>Verify your email</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
        <div className="bg-card p-8 rounded-lg shadow-card w-full max-w-md space-y-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="1.5" className="text-primary"/>
              <path d="M22 6L12.97 11.46C12.37 11.82 11.63 11.82 11.03 11.46L2 6" stroke="currentColor" strokeWidth="1.5" className="text-primary"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Verify your email</h1>
          <p className="text-text-secondary">
            We have sent a verification link to{` `}
            <span className="font-medium text-foreground">{email || 'your email'}</span>.
            Please check your inbox and click the link to activate your account.
          </p>
          <div className="text-sm text-text-secondary">
            Didn&apos;t receive the email? Check your spam folder or try again.
          </div>
          <div className="flex items-center justify-center gap-3">
            <Link href="/login" className="text-primary hover:underline">Back to login</Link>
            <span className="text-border">|</span>
            <button className="text-primary hover:underline" onClick={() => router.reload()}>Resend email</button>
          </div>
        </div>
      </div>
    </>
  );
}