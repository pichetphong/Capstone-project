'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';

// ✅ หมวดหมู่และวัตถุดิบ (ใช้ `/images/logo.png` แทน)
const categories = [
  {
    name: 'โปรตีน',
    img: '/images/logo.png',
    details: [
      { name: 'เนื้อหมู', img: '/images/logo.png' },
      { name: 'ไก่', img: '/images/logo.png' },
      { name: 'ปลา', img: '/images/logo.png' },
    ],
  },
  {
    name: 'คาร์โบไฮเดรต',
    img: '/images/logo.png',
    details: [
      { name: 'ข้าว', img: '/images/logo.png' },
      { name: 'มันฝรั่ง', img: '/images/logo.png' },
      { name: 'ขนมปัง', img: '/images/logo.png' },
    ],
  },
  {
    name: 'คาร์โบไฮเดรต',
    img: '/images/logo.png',
    details: [
      { name: 'ข้าว', img: '/images/logo.png' },
      { name: 'มันฝรั่ง', img: '/images/logo.png' },
      { name: 'ขนมปัง', img: '/images/logo.png' },
    ],
  },
];

const IngredientsModal = ({ open, setOpen, setSelectedItems }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              เลือกหมวดหมู่
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            {categories.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center cursor-pointer"
                onClick={() => setSelectedCategory(item)}
              >
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg shadow-md"
                />
                <span className="mt-2 font-medium">{item.name}</span>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full"
          >
            ปิด
          </Button>
        </DialogContent>
      </Dialog>

      {/* SubModal สำหรับเลือกวัตถุดิบ */}
      {selectedCategory && (
        <Dialog
          open={!!selectedCategory}
          onOpenChange={() => setSelectedCategory(null)}
        >
          <DialogContent className="max-w-md rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {selectedCategory.name}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
              {selectedCategory.details.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => {
                    setSelectedItems((prev) => [...prev, item]); // ✅ เพิ่มวัตถุดิบไป Table
                    setSelectedCategory(null);
                    setOpen(false);
                  }}
                >
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg shadow-md"
                  />
                  <span className="mt-2 font-medium">{item.name}</span>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={() => setSelectedCategory(null)}
              className="w-full"
            >
              ปิด
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default IngredientsModal;
