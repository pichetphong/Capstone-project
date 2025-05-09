'use client';

import TableProfile from '../../components/profile/TableProfile';
import TableResult from '../../components/profile/TableResult';
import Meals from '../../components/profile/Meals';
import ProfileChart from '../../components/profile/ProfileChart';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function profile() {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div>
                <h1 className="text-2xl md:text-6xl font-bold mb-4 ">
                  ข้อมูลส่วนตัว
                </h1>
                <TableProfile />
              </div>
              <div>
                <TableResult />
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-6xl font-bold mb-4 ">กราฟ</h1>
              <ProfileChart />
            </div>
          </div>
        </section>
      </>
    )
  );
}
