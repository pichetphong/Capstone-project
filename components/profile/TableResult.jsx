'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';

export default function TableResult() {
  return (
    <div className="container bg-gray-400 bg-opacity-50 mx-auto mb-5 p-5 rounded-xl text-white font-semibold">
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="w-[100px]">Gender</TableCell>
            <TableCell className="w-[50px]">:</TableCell>
            <TableCell className="min-w-[100px]">MEAL</TableCell>
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
          <TableRow>
            <TableCell>Goal</TableCell>
            <TableCell>:</TableCell>
            <TableCell>MAINTAIN</TableCell>
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
          <TableRow className="hover:bg-transparent">
            <TableCell>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary">Update</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogTitle>Edit Details</DialogTitle>
                  <DialogDescription>
                    Adjust your fitness goals and preferences.
                  </DialogDescription>
                  <Card>
                    <CardContent className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="goal">Age</Label>
                        <Input id="goal" defaultValue="18" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="diet">Weight</Label>
                        <Input id="diet" defaultValue="65" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="activity">Height</Label>
                        <Input id="activity" defaultValue="175" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="activity">Goal</Label>
                        <Input id="activity" defaultValue="MAINTAIN" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="activity">DietType</Label>
                        <Input id="activity" defaultValue="BALANCED" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="activity">ActivityLevel</Label>
                        <Input id="activity" defaultValue="SEDENTARY" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button>Save changes</Button>
                    </CardFooter>
                  </Card>
                </DialogContent>
              </Dialog>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
