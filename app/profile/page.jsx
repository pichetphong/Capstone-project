'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function profile() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <section className="container mx-auto my-5 px-6 py-5 bg-maroon rounded-2xl">
        <h1 className="text-2xl md:text-6xl font-bold mb-2 text-white">
          Profile
        </h1>
        <div className="container bg-gray-400 bg-opacity-50 mx-auto mb-5 p-5 rounded-xl text-white">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium w-[100px]">Email</TableCell>
                <TableCell className="w-[50px]">:</TableCell>
                <TableCell className="min-w-[100px]">
                  Pichetphong@test.com
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Password</TableCell>
                <TableCell>:</TableCell>
                <TableCell className="password flex items-center justify-between">
                  {showPassword ? '1242523' : '••••••••••'}
                  <button onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>:</TableCell>
                <TableCell>Pichetphong Kaesanthiah</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Gender</TableCell>
                <TableCell>:</TableCell>
                <TableCell>MEAL</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Age</TableCell>
                <TableCell>:</TableCell>
                <TableCell>18</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Weight</TableCell>
                <TableCell>:</TableCell>
                <TableCell>65</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Height</TableCell>
                <TableCell>:</TableCell>
                <TableCell>175</TableCell>
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableCell>
                  <Button>Edit Profile</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <h1 className="text-2xl md:text-6xl font-bold mb-2 text-white">
          Result
        </h1>
        <div className="container bg-gray-400 bg-opacity-50 mx-auto mb-5 p-5 rounded-xl text-white">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium w-[100px]">Goal</TableCell>
                <TableCell className="w-[50px]">:</TableCell>
                <TableCell className="min-w-[100px]">MAINTAIN</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>DietType</TableCell>
                <TableCell>:</TableCell>
                <TableCell>BALANCED</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>ActivityLevel</TableCell>
                <TableCell>:</TableCell>
                <TableCell>SEDENTARY</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>BMI</TableCell>
                <TableCell>:</TableCell>
                <TableCell>18</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>BMR</TableCell>
                <TableCell>:</TableCell>
                <TableCell>65</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>TDEE</TableCell>
                <TableCell>:</TableCell>
                <TableCell>175</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>
    </>
  );
}
