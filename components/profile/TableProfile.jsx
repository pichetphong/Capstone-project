'use client';

import { useSession } from 'next-auth/react';

import { useState } from 'react';
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
import { Eye, EyeOff } from 'lucide-react';

export default function TableProfile() {
  const { data: session, status } = useSession();

  const [showPassword, setShowPassword] = useState(false);

  return (
    status === 'authenticated' &&
    session.user && (
      <>
        <div className="container bg-gray-400 bg-opacity-50 mx-auto mb-5 p-5 rounded-xl text-white font-semibold">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="w-[100px]">Email</TableCell>
                <TableCell className="w-[50px]">:</TableCell>
                <TableCell className="min-w-[100px]">
                  {session.user.email}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>:</TableCell>
                <TableCell>{session.user.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Password</TableCell>
                <TableCell>:</TableCell>
                <TableCell className="password flex items-center justify-between">
                  {showPassword ? 'มะบอกหรอกน้าา' : '••••••••••'}
                  <button onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </TableCell>
              </TableRow>

              <TableRow className="hover:bg-transparent">
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary">Edit Profile</Button>
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
                                  defaultValue={session.user.name}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="username">Email</Label>
                                <Input
                                  id="email"
                                  defaultValue={session.user.email}
                                />
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Button>Save changes</Button>
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
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </>
    )
  );
}
