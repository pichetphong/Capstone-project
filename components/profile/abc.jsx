<div className="grid md:grid-cols-2 lg:grid-cols-3 4xl:grid-cols-4 gap-4">
  <div>
    <div className="text-xl md:text-3xl font-bold mt-3 text-white">Monday</div>
    <Carousel
      opts={{
        align: 'start',
      }}
      className="w-full max-w-none "
    >
      <CarouselContent>
        {Array.from({ length: 3 }).map((_, index) => (
          <CarouselItem key={index} className="w-full ">
            <div className="p-1">
              <Card className="h-auto">
                <CardContent className="flex items-center justify-center p-6">
                  <span className="text-3xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  </div>
  <div>
    <div className="text-xl md:text-3xl font-bold mt-3 text-white">Tuesday</div>
    <Carousel
      opts={{
        align: 'start',
      }}
      className="w-full max-w-none "
    >
      <CarouselContent>
        {Array.from({ length: 3 }).map((_, index) => (
          <CarouselItem key={index} className="w-full ">
            <div className="p-1">
              <Card className="h-auto">
                <CardContent className="flex items-center justify-center p-6">
                  <span className="text-3xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  </div>
  <div>
    <div className="text-xl md:text-3xl font-bold mt-3 text-white">
      Wednesday
    </div>
    <Carousel
      opts={{
        align: 'start',
      }}
      className="w-full max-w-none "
    >
      <CarouselContent>
        {Array.from({ length: 3 }).map((_, index) => (
          <CarouselItem key={index} className="w-full ">
            <div className="p-1">
              <Card className="h-auto">
                <CardContent className="flex items-center justify-center p-6">
                  <span className="text-3xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  </div>
  <div>
    <div className="text-xl md:text-3xl font-bold mt-3 text-white">
      Thursday
    </div>
    <Carousel
      opts={{
        align: 'start',
      }}
      className="w-full max-w-none "
    >
      <CarouselContent>
        {Array.from({ length: 3 }).map((_, index) => (
          <CarouselItem key={index} className="w-full ">
            <div className="p-1">
              <Card className="h-auto">
                <CardContent className="flex items-center justify-center p-6">
                  <span className="text-3xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  </div>
  <div>
    <div className="text-xl md:text-3xl font-bold mt-3 text-white">Friday</div>
    <Carousel
      opts={{
        align: 'start',
      }}
      className="w-full max-w-none "
    >
      <CarouselContent>
        {Array.from({ length: 3 }).map((_, index) => (
          <CarouselItem key={index} className="w-full ">
            <div className="p-1">
              <Card className="h-auto">
                <CardContent className="flex items-center justify-center p-6">
                  <span className="text-3xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  </div>
  <div>
    <div className="text-xl md:text-3xl font-bold mt-3 text-white">
      Saturday
    </div>
    <Carousel
      opts={{
        align: 'start',
      }}
      className="w-full max-w-none "
    >
      <CarouselContent>
        {Array.from({ length: 3 }).map((_, index) => (
          <CarouselItem key={index} className="w-full ">
            <div className="p-1">
              <Card className="h-auto">
                <CardContent className="flex items-center justify-center p-6">
                  <span className="text-3xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  </div>
  <div>
    <div className="text-xl md:text-3xl font-bold mt-3 text-white">Sunday</div>
    <Carousel
      opts={{
        align: 'start',
      }}
      className="w-full max-w-none "
    >
      <CarouselContent>
        {Array.from({ length: 3 }).map((_, index) => (
          <CarouselItem key={index} className="w-full ">
            <div className="p-1">
              <Card className="h-auto">
                <CardContent className="flex items-center justify-center p-6">
                  <span className="text-3xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  </div>
</div>;

{
  days.map((day) => (
    <div key={day}>
      <div className="text-xl md:text-3xl font-bold mt-3 text-white">{day}</div>
    </div>
  ));
}

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
