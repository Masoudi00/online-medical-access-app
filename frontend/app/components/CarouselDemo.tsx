"use client";

import { Carousel } from "./ui/Carousel";
import { useLanguage } from "../context/LanguageContext";

export function CarouselDemo() {
  const { translations } = useLanguage();

  const slideData = [
    {
      title: translations.emergencyTitle || "Emergency",
      button: translations.exploreButton || "Explore",
      src: "test.jpg",
    },
    {
      title: translations.appointmentTitle || "Appointment",
      button: translations.exploreButton || "Explore",
      src: "Appointement.jpg"
    },
    {
      title: translations.communityTitle || "Community",
      button: translations.exploreButton || "Explore",
      src: "Community.jpg"
    },
  ];

  return (
    <div className="relative overflow-hidden w-full h-full py-20 flex items-center justify-center min-h-screen" id="Carousel">
      <Carousel slides={slideData} />
    </div>
  );
}
