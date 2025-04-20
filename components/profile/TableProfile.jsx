'use client';

import { useSession } from 'next-auth/react';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { FaSpinner } from 'react-icons/fa';

export default function TableProfile() {
  const { data: session, status, update } = useSession();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = session?.user?.id;

  const isGoogleLogin = session?.user?.provider === 'google';

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/user/${userId}`);
        if (!res.ok) throw new Error('ไม่พบบันชีผู้ใช้');

        const json = await res.json();

        setData(json);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleUpdate = async () => {
    if (!userId) {
      setMessage('ไม่พบไอดีผู้ใช้');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`http://localhost:3000/api/user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) throw new Error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');

      await update();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading)
    return <FaSpinner className="animate-spin text-4xl" />;

  const user = data;
  if (!user || !user.id) return <p>ไม่พบผู้ใช้</p>;

  const details = [
    { label: 'อีเมลล์', key: 'email' },
    { label: 'ชื่อ', key: 'name' },
  ];

  return (
    status === 'authenticated' &&
    session.user && (
      <>
        <div className="container text-black bg-white shadow-md rounded-lg p-4  mx-auto mb-5   ">
          <Table>
            <TableBody>
              {details.map(({ label, key }) => (
                <TableRow key={key}>
                  <TableCell className="w-[100px] font-semibold">
                    {label}
                  </TableCell>
                  <TableCell className="w-[50px]">:</TableCell>
                  <TableCell className="min-w-[100px]">{user[key]}</TableCell>
                </TableRow>
              ))}
              <TableRow className="hover:bg-transparent">
                <TableCell>
                  <Dialog>
                    {!isGoogleLogin && (
                      <DialogTrigger asChild>
                        <Button disabled={isGoogleLogin}>
                          แก้ไขข้อมูลส่วนตัว
                        </Button>
                      </DialogTrigger>
                    )}

                    <DialogContent className="max-w-lg">
                      <DialogTitle>แก้ไขข้อมูลส่วนตัว</DialogTitle>
                      <DialogDescription>
                        ปรับแต่งข้อมูลส่วนตัวของคุณที่นี่
                      </DialogDescription>
                      <Tabs defaultValue="account" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="account">บัญชี</TabsTrigger>
                          <TabsTrigger value="password">รหัสผ่าน</TabsTrigger>
                        </TabsList>
                        <TabsContent value="account">
                          <Card>
                            <CardHeader>
                              <CardTitle>บัญชี</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="space-y-1">
                                <Label htmlFor="name">ชื่อ</Label>
                                <Input
                                  id="name"
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="email">อีเมลล์</Label>
                                <Input
                                  id="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                />
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Button onClick={handleUpdate} disabled={loading}>
                                {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่าน'}
                              </Button>
                            </CardFooter>
                          </Card>
                        </TabsContent>
                        <TabsContent value="password">
                          <Card>
                            <CardHeader>
                              <CardTitle>รหัสผ่าน</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="space-y-1">
                                <Label htmlFor="current">
                                  รหัสผ่านปัจจุบัน
                                </Label>
                                <Input id="current" type="password" />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="new">รหัสผ่านใหม่</Label>
                                <Input id="new" type="password" />
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Button>บันทึกรหัสผ่าน</Button>
                            </CardFooter>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                <TableCell />
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
          {message && (
            <div className=" text-sm mt-2">
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2">
                {message}
              </div>
            </div>
          )}
        </div>
      </>
    )
  );
}
