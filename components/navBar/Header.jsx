import Image from 'next/image';
import DropdownListMenu from './DropdownListMenu';
import { ModeToggle } from './ModeToggle';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="p-4 sticky top-0 z-50 backdrop-blur-sm transition-all duration-500 ease-in-out">
      <div className=" mx-auto flex items-center justify-between bg-white rounded-2xl shadow-lg ">
        <div className="flex items-center pl-4">
          <Link href="/">
            <Image src="/images/logo.png" alt="Logo" width={75} height={75} />
          </Link>
        </div>

        <div className="flex gap-4 pr-4">
          <ModeToggle />
          <DropdownListMenu />
        </div>
      </div>
    </header>
  );
}
