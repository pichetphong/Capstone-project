'use client';

import { useSession } from 'next-auth/react';

import { Card, CardContent } from '../ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui/carousel';

export default function Meals() {
  const { data: session, status } = useSession();

  return (
    status === 'authenticated' &&
    session.user && (
      <>
        <div className="container bg-gray-400 bg-opacity-50 mx-auto mb-5 p-5 px-20 rounded-xl text-white font-semibold w-full">
          <Carousel
            opts={{
              align: 'start',
            }}
            className="w-full max-w-none "
          >
            <CarouselContent>
              {Array.from({ length: 7 }).map((_, index) => (
                <CarouselItem
                  key={index}
                  className="w-full md:basis-1/2 lg:basis-1/3 xl:basis-1/3"
                >
                  <div className="p-1">
                    <Card className="h-[300px]">
                      <CardContent className="flex items-center justify-center p-6">
                        <span className="text-3xl font-semibold">
                          {index + 1}
                        </span>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </>
    )
  );
}
