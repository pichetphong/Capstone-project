import { Button } from '../ui/button';

export default function Footer() {
  return (
    <footer className="bg-blacky text-white py-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src="/images/logo.png" alt="Logo" className="h-10 w-auto" />
          <span className="text-lg font-semibold">NutriPlanner</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6 text-sm mt-4 md:mt-0">
          <Button variant="link2">เกี่ยวกับเรา</Button>
          <Button variant="link2">บริการ</Button>
          <Button variant="link2">ช่องทางการติดต่อ</Button>
          <Button variant="link2">นโยบายบริษัท</Button>
        </nav>
      </div>

      {/* Copyright */}
      <div className="text-center text-xs text-gray-400 mt-4">
        © {new Date().getFullYear()} NutriPlanner All rights reserved.
      </div>
    </footer>
  );
}
