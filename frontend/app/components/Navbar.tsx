"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import ProfilePopUp from "./ProfilePopUp";
import { authFetch } from "@/app/utils/auth";

interface NavLink {
  href: string;
  label: string;
  onClick?: () => void;
  isButton?: boolean;
}

interface UserProfile {
  profile_picture: string | null;
}

const Navbar = () => {
  const [isClick, setIsClick] = useState(false); // mobile menu open
  const [isProfileOpen, setIsProfileOpen] = useState(false); // popup open
  const { isLoggedIn } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const desktopProfileRef = useRef<HTMLButtonElement>(null);
  const mobileProfileRef = useRef<HTMLButtonElement>(null);

  const fetchNotifications = async () => {
    if (isLoggedIn) {
      try {
        const res = await authFetch("http://localhost:8000/notifications");
        if (res?.ok) {
          const data = await res.json();
          const unreadNotifications = data.filter((n: any) => !n.is_read);
          setUnreadCount(unreadNotifications.length);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (isLoggedIn) {
        try {
          const res = await authFetch("http://localhost:8000/profile/me");
          if (res?.ok) {
            const data = await res.json();
            setProfile(data);
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      }
    };

    fetchProfile();
    fetchNotifications();

    // Set up polling for notifications
    const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const toggleNavbar = () => {
    setIsClick(!isClick);
  };

  const navLinks: NavLink[] = isLoggedIn
    ? []
    : [
        { href: "/login", label: "Login" },
        { href: "/register", label: "Register" },
      ];

  const linkClasses =
    "text-white hover:bg-white hover:text-black rounded-lg p-2 transition duration-300";

  // Decide which profile button ref to use
  const activeAnchorRef = isClick ? mobileProfileRef : desktopProfileRef;

  const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";

  return (
    <>
      <nav className="bg-#0c1117 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/">
                  <Image src="/Logo.png" alt="Logo" width={30} height={30} />
                </Link>
              </div>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:block">
              <div className="ml-4 flex items-center space-x-4">
                {navLinks.map((link) =>
                  link.isButton ? (
                    <button
                      key={link.label}
                      onClick={link.onClick}
                      className={linkClasses}
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      key={link.label}
                      href={link.href}
                      className={linkClasses}
                    >
                      {link.label}
                    </Link>
                  )
                )}
                {isLoggedIn && (
                  <div className="relative">
                    <button
                      ref={desktopProfileRef}
                      onClick={() => setIsProfileOpen(true)}
                      className="flex items-center p-1 rounded-full hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-105 group"
                    >
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white group-hover:border-blue-400 transition-all duration-300 ring-2 ring-transparent group-hover:ring-blue-500/50">
                          <Image
                            src={profile?.profile_picture 
                              ? (profile.profile_picture.startsWith('http') 
                                ? profile.profile_picture 
                                : `http://localhost:8000${profile.profile_picture}`)
                              : defaultAvatar}
                            alt="Profile"
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-black">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleNavbar}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-gray-700 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {!isClick ? (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`${isClick ? "block" : "hidden"} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) =>
              link.isButton ? (
                <button
                  key={link.label}
                  onClick={link.onClick}
                  className="block w-full text-left text-white hover:bg-white hover:text-black rounded-lg p-2 transition duration-300"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-white hover:bg-white hover:text-black rounded-lg p-2 transition duration-300"
                >
                  {link.label}
                </Link>
              )
            )}
            {isLoggedIn && (
              <div className="relative">
                <button
                  ref={mobileProfileRef}
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center w-full text-white hover:bg-white hover:text-black rounded-lg p-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="relative mr-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white hover:border-blue-400 transition-all duration-300 ring-2 ring-transparent hover:ring-blue-500/50">
                      <Image
                        src={profile?.profile_picture 
                          ? (profile.profile_picture.startsWith('http') 
                            ? profile.profile_picture 
                            : `http://localhost:8000${profile.profile_picture}`)
                          : defaultAvatar}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-black">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  Profile
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Profile Pop-Up (outside of nav for proper z-index) */}
      <ProfilePopUp
        isOpen={isProfileOpen}
        onClose={() => {
          setIsProfileOpen(false);
          fetchNotifications(); // Refresh notifications when popup closes
        }}
        anchorRef={activeAnchorRef}
      />
    </>
  );
};

export default Navbar;
