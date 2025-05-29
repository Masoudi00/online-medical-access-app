"use client";

import Link from "next/link";

export default function PricingSection() {
    const scrollToCarousel = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      const carouselElement = document.getElementById('Carousel');
      if (carouselElement) {
        carouselElement.scrollIntoView({ behavior: 'smooth' });
      }
    };

    return (
      <section className="b text-white py-48 text-center px-4 h-screen">
        <h1 className="text-5xl text-green-200 font-semibold mb-6">Your Health, One Click Away</h1>
        <p className="text-lg max-w-2xl mx-auto mb-4">
        Access trusted doctors, book appointments, and get care from the comfort of your home. Our platform connects you with licensed medical professionals, anytime, anywhere.
          <span className="text-green-400"> Morocco&apos;s</span> First ever online medical access.
        </p>
        <p className="text-lg mb-10">Simple. Secure. Always here for you.</p>

        <Link href="#Carousel" onClick={scrollToCarousel}>
        <button className="bg-white text-black font-medium py-3 px-6 rounded-md hover:bg-gray-200 transition">
          Call
        </button>
        </Link>

        <Link href="#Carousel" onClick={scrollToCarousel}>
          <p className="text-center text-gray-500 underline">More </p>
        </Link>

      </section>
    );
  }
  