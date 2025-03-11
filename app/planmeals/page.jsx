'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import IngredientsModal from '../../components/meals/IngredientsModal';

export default function PlanMeals() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // ✅ State ควบคุม Modal และรายการที่เลือก
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }

    if (status === 'authenticated' && !session?.user?.id) {
      update();
    }
  }, [status, session]);

  // ✅ ฟังก์ชันลบรายการออกจาก Table
  const removeItem = (index) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    status === 'authenticated' &&
    session.user && (
      <>
        <section className="container mx-auto my-5 px-6 py-5  rounded-2xl">
          <div className="text-2xl md:text-6xl font-bold mb-2">
            create your meal plan
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Button onClick={() => setOpen(true)}>เลือกวัตถุดิบ</Button>

              <IngredientsModal
                open={open}
                setOpen={setOpen}
                setSelectedItems={setSelectedItems}
              />
            </div>
          </div>

          {selectedItems.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รูป</TableHead>
                  <TableHead>ชื่อวัตถุดิบ</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className=" font-semibold">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </TableCell>
                    <TableCell className="">{item.name}</TableCell>
                    <TableCell className="">
                      <Button
                        variant="destructive"
                        onClick={() => removeItem(index)}
                      >
                        นำออก
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </>
    )
  );
}
