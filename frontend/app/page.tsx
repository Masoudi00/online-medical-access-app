'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import Image from 'next/image';
import Footer from './components/Footer';

gsap.registerPlugin(ScrollTrigger);

const routes = [
  {
    title: 'Appointments',
    description: 'Book medical appointments and manage your healthcare schedule with ease',
    path: '/appointments',
    image: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?q=80&w=2070',
    color: 'from-blue-500/20 to-blue-700/20'
  },
  {
    title: 'Community',
    description: 'Share and explore real medical experiences from our trusted community',
    path: '/community',
    image: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2070',
    color: 'from-purple-500/20 to-purple-700/20'
  },
  {
    title: 'Profile',
    description: 'Manage your medical profile, preferences, and account settings',
    path: '/profile',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=2070',
    color: 'from-emerald-500/20 to-emerald-700/20'
  },
  {
    title: 'Help Center',
    description: 'Find answers to your questions and get support when you need it',
    path: '/help',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070',
    color: 'from-indigo-500/20 to-indigo-700/20'
  }
];

export default function Home() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { translations } = useLanguage();
  const mainRef = useRef(null);

  const handleExplore = (path: string) => {
    if (isLoggedIn) {
      router.push(path);
    } else {
      router.push('/signin');
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero section animations
      gsap.from('.hero-content > *', {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out'
      });

      // Route cards animation
      gsap.from('.route-card', {
        scrollTrigger: {
          trigger: '.routes-grid',
          start: 'top center',
          end: 'bottom center',
        },
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out'
      });
    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <main ref={mainRef} className="min-h-screen overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center px-4">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=2091"
              alt="Modern medical facility"
              fill
              className="object-cover opacity-20"
              priority
              quality={100}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0c1117] via-[#0c1117]/80 " />
          </div>
          
          <div className="hero-content relative z-10 max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white">
              {translations.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              {translations.heroDescription}
            </p>
            {!isLoggedIn && (
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => router.push('/register')}
                  className="px-8 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-all"
                >
                  {translations.signUp}
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="px-8 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all"
                >
                  {translations.signIn}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Routes Grid - Only shown to logged-in users */}
        {isLoggedIn && (
          <section className="relative py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
                Our Services
              </h2>
              
              <div className="routes-grid grid grid-cols-1 md:grid-cols-2 gap-8">
                {routes.map((route, index) => (
                  <div
                    key={route.path}
                    className="route-card group relative overflow-hidden rounded-2xl cursor-pointer"
                    onClick={() => handleExplore(route.path)}
                  >
                    <div className="aspect-[16/9] relative">
                      <Image
                        src={route.image}
                        alt={route.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        quality={90}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${route.color} mix-blend-soft-light`} />
                      <div className="absolute inset-0 bg-gray-900/60" />
                      
                      <div className="absolute inset-0 p-8 flex flex-col justify-end">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {route.title}
                        </h3>
                        <p className="text-gray-300 mb-4">
                          {route.description}
                        </p>
                        <div className="transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <button className="px-6 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                            {translations.exploreButton}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section - Only shown to non-logged-in users */}
        {!isLoggedIn && (
          <section className="relative py-20 px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                {translations.footerMainMessage}
              </h2>
              <p className="text-lg text-gray-300">
                {translations.footerSecondaryMessage}
              </p>
              <button
                onClick={() => router.push('/register')}
                className="px-8 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-all"
              >
                {translations.signUp}
              </button>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
