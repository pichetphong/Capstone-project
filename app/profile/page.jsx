'use client';

import TableProfile from './components/TableProfile';
import TableResult from './components/TableResult';

export default function profile() {
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
      </section>
    </>
  );
}
