"use client";

import { Carousel } from "./ui/Carousel";
export function CarouselDemo() {
  const slideData = [
    {
      title: "Emergency", 
      button: "Explore ",
      src: "test.jpg",
    },
 
    {
      title: "Appointment",
      button: "Explore",
      src: "Appointement.jpg"
    },
  
    {
      title: "Community",
      button: "Explore",
      src:"Community.jpg"
    },
  ];
  return (
    <div className="relative overflow-hidden w-full h-full py-20 flex items-center justify-center min-h-screen" id="Carousel">
      <Carousel slides={slideData} />
    </div>
  );
}
