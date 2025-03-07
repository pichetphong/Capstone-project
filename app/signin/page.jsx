'use client';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SigninPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <img src="/images/logo.png" alt="Logo" className="w-16 h-16 mb-4" />
          <h1 className="text-3xl font-bold text-blacky mb-6">Log in</h1>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2">
              {error}
            </div>
          )}

          <Input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="email address"
            className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-maroon"
          />
          <Input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="password"
            className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-maroon"
          />

          <Button
            // type="submit"
            variant="outlin3"
            className="w-full px-4 py-2 bg-primary text-primary-foreground "
          >
            Log in
          </Button>
        </form>
        <div className="flex items-center justify-center my-4">
          <span className="text-blacky text-sm">or sign in with</span>
        </div>
        <div className="flex items-center justify-center">
          <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-100 focus:outline-none">
            <img
              src="/icons8-google.svg"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            <span className="text-blacky">Google</span>
          </button>
        </div>
        <br />
        <br />
        <br />
        <br />
        <br />
        <p className="mt-4 text-xs text-center text-blacky">
          Don't have an account?{' '}
          <Link
            href="/signup"
            className="text-maroon font-medium hover:underline"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
