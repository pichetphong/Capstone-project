'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '../components/navBar/Header';
import Footer from '../components/navBar/Footer';
import Provider from './provider';
import { usePathname } from 'next/navigation';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // ✅ หน้าที่ไม่ต้องใช้ Layout
  const noLayoutRoutes = ['/signin', '/signup'];

  const shouldUseLayout = !noLayoutRoutes.includes(pathname);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Provider>
          {shouldUseLayout && <Header />}

          {/* ใช้ flex-grow เพื่อให้ส่วนนี้ขยายเต็มที่และดัน Footer ลงล่าง */}
          <main className="flex-grow">{children}</main>

          {shouldUseLayout && <Footer />}
        </Provider>
      </body>
    </html>
  );
}
