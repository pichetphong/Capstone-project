'use client';

import { AlignLeft } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import UserIcon from './UserIcon';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react'; // นำเข้า useSession เพื่อตรวจสอบสถานะการเข้าสู่ระบบ

const DropdownListMenu = () => {
  const { data: session, status } = useSession(); // ใช้ useSession เพื่อตรวจสอบสถานะการเข้าสู่ระบบ
  const links = [
    { href: '/', label: 'หน้าหลัก' },
    { href: '/profile', label: 'ข้อมูลส่วนตัว' },
    { href: '/planmeals', label: 'มื้ออาหาร' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <AlignLeft />
          <UserIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {status === 'authenticated' ? (
          <>
            <DropdownMenuLabel>
              สวัสดีคุณ {session?.user?.name}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        ) : null}
        {status === 'authenticated' ? (
          <>
            {links.map((item, index) => (
              <DropdownMenuItem key={index} asChild className="cursor-pointer">
                <Link href={item.href}>{item.label}</Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <button onClick={() => signOut({ callbackUrl: '/' })}>
                ออกจากระบบ
              </button>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem>
              <Link href="/signup">สมัครเข้าสู่ระบบ</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/signin">เข้าสู่ระบบ</Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownListMenu;
