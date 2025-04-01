'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Meals from '../../components/profile/Meals';

export default function meals() {
  const { data: session, status, update } = useSession();

  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }

    if (status === 'authenticated' && !session?.user?.id) {
      update();
    }
  }, [status, session]);

  return (
    status === 'authenticated' &&
    session.user && (
      <>
        <section className="container mx-auto my-5 px-6 py-5  rounded-2xl">
          <div className="">
            <h1 className="text-2xl md:text-6xl font-bold mb-4 ">เมนูอาหาร</h1>
            <Meals />
          </div>
        </section>
      </>
    )
  );
}
