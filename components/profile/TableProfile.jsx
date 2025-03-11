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
  CardDescription,
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

  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/user/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch user data');

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
      setMessage('User ID not found');
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

      if (!res.ok) throw new Error('Failed to update user data');

      await update();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading)
    return <FaSpinner className="animate-spin text-4xl" />;
  if (!userId) return <p className="text-red-500">User ID not found</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  const user = data;
  if (!user || !user.id) return <p>No user Found.</p>;

  const details = [
    { label: 'Email', key: 'email' },
    { label: 'Name', key: 'name' },
  ];

  return (
    status === 'authenticated' &&
    session.user && (
      <>
        <div className="container bg-gray-400 bg-opacity-50 mx-auto mb-5 p-5 rounded-xl  ">
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
                    <DialogTrigger asChild>
                      <Button variant="">Edit Profile</Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-lg">
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>
                        Adjust your Profile.
                      </DialogDescription>
                      <Tabs defaultValue="account" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="account">Account</TabsTrigger>
                          <TabsTrigger value="password">Password</TabsTrigger>
                        </TabsList>
                        <TabsContent value="account">
                          <Card>
                            <CardHeader>
                              <CardTitle>Account</CardTitle>
                              <CardDescription>
                                Make changes to your account here. Click save
                                when you're done.
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="space-y-1">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                  id="name"
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                  id="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                />
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Button onClick={handleUpdate} disabled={loading}>
                                {loading ? 'Updating...' : 'Save changes'}
                              </Button>
                            </CardFooter>
                          </Card>
                        </TabsContent>
                        <TabsContent value="password">
                          <Card>
                            <CardHeader>
                              <CardTitle>Password</CardTitle>
                              <CardDescription>
                                Change your password here. After saving, you'll
                                be logged out.
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="space-y-1">
                                <Label htmlFor="current">
                                  Current password
                                </Label>
                                <Input id="current" type="password" />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="new">New password</Label>
                                <Input id="new" type="password" />
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Button>Save password</Button>
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
