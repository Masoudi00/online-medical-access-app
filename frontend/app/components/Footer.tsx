"use client";

import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import {
  GithubOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  InstagramOutlined,
  FacebookOutlined
} from '@ant-design/icons';

const Footer = () => {
  const { translations } = useLanguage();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Services',
      links: [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Appointments', href: '/appointments' },
        { name: 'Community', href: '/community' },
        { name: 'Profile', href: '/profile' },
        { name: 'Help Center', href: '/help' }
      ]
    },
    {
      title: 'Account',
      links: [
        { name: 'Settings', href: '/settings' },
        { name: 'Register', href: '/register' },
        { name: 'Login', href: '/login' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
      ]
    }
  ];

  const socialLinks = [
    { name: 'GitHub', icon: <GithubOutlined />, href: 'https://github.com' },
    { name: 'Twitter', icon: <TwitterOutlined />, href: 'https://twitter.com' },
    { name: 'LinkedIn', icon: <LinkedinOutlined />, href: 'https://linkedin.com' },
    { name: 'Instagram', icon: <InstagramOutlined />, href: 'https://instagram.com' },
    { name: 'Facebook', icon: <FacebookOutlined />, href: 'https://facebook.com' }
  ];

  return (
    <footer className="relative mt-20  border-t border-gray-800">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8">
        {/* Main Footer Content */}
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand Section */}
          <div className="space-y-8">
            <Link href="/" className="text-2xl font-bold text-white">
              Medical Access
            </Link>
            <p className="text-sm leading-6 text-gray-300">
              Making healthcare accessible and convenient for everyone, everywhere.
            </p>
            {/* Social Links */}
            <div className="flex space-x-6">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-300 text-xl"
                >
                  <span className="sr-only">{item.name}</span>
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {footerLinks.slice(0, 2).map((group) => (
                <div key={group.title}>
                  <h3 className="text-sm font-semibold leading-6 text-white">
                    {group.title}
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {group.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-sm leading-6 text-gray-300 hover:text-white transition-colors duration-300"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="md:grid md:grid-cols-1">
              {footerLinks.slice(2).map((group) => (
                <div key={group.title}>
                  <h3 className="text-sm font-semibold leading-6 text-white">
                    {group.title}
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {group.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-sm leading-6 text-gray-300 hover:text-white transition-colors duration-300"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-16 border-t border-gray-800 pt-8 sm:mt-20 lg:mt-24">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs leading-5 text-gray-400">
              &copy; {currentYear} MedConnect. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="text-xs leading-5 text-gray-400 hover:text-white transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-xs leading-5 text-gray-400 hover:text-white transition-colors duration-300"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-xs leading-5 text-gray-400 hover:text-white transition-colors duration-300"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
