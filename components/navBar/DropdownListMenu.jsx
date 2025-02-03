import { AlignLeft, CircleUserRound } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
// import { Button } from '@/ui/button';
import UserIcon from './UserIcon';
import Link from 'next/link';
import { links } from '../../utils/links';

const DropdownListMenu = () => {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            <AlignLeft />
            <UserIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {links.map((item, index) => {
            return (
              <DropdownMenuItem key={index} asChild className="cursor-pointer">
                <Link href={item.href}>{item.label}</Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* <AlignLeft />
      <CircleUserRound /> */}
    </>
  );
};
export default DropdownListMenu;
