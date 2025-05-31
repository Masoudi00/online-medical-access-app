"use client";

import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";

export default function Hero() {
    const { translations } = useLanguage();
    
    const scrollToCarousel = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const carouselElement = document.getElementById('Carousel');
      if (carouselElement) {
        carouselElement.scrollIntoView({ behavior: 'smooth' });
      }
    };

    return (
      <section className="b text-white py-48 text-center px-4 h-screen">
        <h1 className="text-5xl text-green-200 font-semibold mb-6">{translations.heroTitle || "Your Health, One Click Away"}</h1>
        <p className="text-lg max-w-2xl mx-auto mb-4">
          {translations.heroDescription || "Access trusted doctors, book appointments, and get care from the comfort of your home. Our platform connects you with licensed medical professionals, anytime, anywhere."}
          <span className="text-green-400"> {translations.heroLocation || "Morocco's"}</span> {translations.heroSubtext || "First ever online medical access."}
        </p>
        <p className="text-lg mb-10">{translations.heroTagline || "Simple. Secure. Always here for you."}</p>


        <Link href="#Carousel" onClick={scrollToCarousel}>
          <p className="text-center text-gray-500 underline">{translations.heroMoreButton || "More"}</p>
        </Link>
      </section>
    );
}
  