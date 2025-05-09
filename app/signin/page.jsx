'use client';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { signIn } from 'next-auth/react';

export default function SigninPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!email || !password) {
        throw new Error('All fields are required');
      }

      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result.error) {
        throw new Error('Invalid email or password');
      }

      router.push('/profile');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center my-10 ">
      <div className="w-full max-w-md p-8  rounded-lg shadow-xl">
        <div className="flex flex-col items-center ">
          <Link href="/">
            <img src="/images/logo.png" alt="Logo" className="w-16 h-16 mb-4" />
          </Link>
          <h1 className="text-3xl font-bold  mb-6">Log in</h1>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2">
              {error}
            </div>
          )}

          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email address"
            className="w-full px-4 py-2 border rounded-lg  "
          />
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            className="w-full px-4 py-2 border rounded-lg  "
          />

          <Button
            type="submit"
            variant="outlin3"
            className="w-full px-4 py-2  "
          >
            Log in
          </Button>
        </form>
        <div className="flex items-center justify-center my-4">
          <span className=" text-sm">or sign in with</span>
        </div>
        <div className="flex items-center justify-center">
          <Button
            type="button"
            onClick={() => signIn('google')}
            variant="outlin3"
            className="flex items-center px-4 py-2 border rounded-lg  "
          >
            <img
              src="/icons8-google.svg"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Google
          </Button>
        </div>
        <br />
        <br />
        <br />
        <br />
        <br />
        <p className="mt-4 text-xs text-center ">
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
