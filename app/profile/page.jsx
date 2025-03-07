'use client';

import TableProfile from '../../components/profile/TableProfile';
import TableResult from '../../components/profile/TableResult';
import Meals from '../../components/profile/Meals';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function profile() {
  const { data: session, status } = useSession();

  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status]);

  console.log('session', session);
  console.log('status', status);

  return (
    <>
      <section className="container mx-auto my-5 px-6 py-5 bg-maroon rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h1 className="text-2xl md:text-6xl font-bold mb-2 text-white">
              Profile
            </h1>
            <TableProfile />
          </div>
          <div>
            <h1 className="text-2xl md:text-6xl font-bold mb-2 text-white">
              Result
            </h1>
            <TableResult />
          </div>
        </div>
        <div className="">
          <h1 className="text-2xl md:text-6xl font-bold mb-2 text-white">
            Meals
          </h1>
          <Meals />
        </div>
      </section>
    </>
  );
}
