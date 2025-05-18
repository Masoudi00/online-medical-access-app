"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import ProfilePopUp from "./ProfilePopUp";

interface NavLink {
  href: string;
  label: string;
  onClick?: () => void;
  isButton?: boolean;
}

const Navbar = () => {
  const [isClick, setIsClick] = useState(false); // mobile menu open
  const [isProfileOpen, setIsProfileOpen] = useState(false); // popup open
  const { isLoggedIn } = useAuth();

  const desktopProfileRef = useRef<HTMLButtonElement>(null);
  const mobileProfileRef = useRef<HTMLButtonElement>(null);

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
                      className="flex items-center"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white hover:border-gray-300 transition duration-300">
                        <Image
                          src="/default-avatar.png"
                          alt="Profile"
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
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
                  className="flex items-center w-full text-white hover:bg-white hover:text-black rounded-lg p-2 transition duration-300"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white hover:border-gray-300 transition duration-300 mr-2">
                    <Image
                      src="/default-avatar.png"
                      alt="Profile"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Profile Pop-Up (outside of nav for proper z-index) */}
      <ProfilePopUp
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        anchorRef={activeAnchorRef}
      />
    </>
  );
};

export default Navbar;
