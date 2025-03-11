'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function PlanMeals() {
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
        <section className="container mx-auto my-5 px-6 py-5 bg-maroon rounded-2xl">
          Hello World
        </section>
      </>
    )
  );
}
