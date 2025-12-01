"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from "next/image";
import { ArrowIcon, XIcon } from '@/icons'; 

const NavbarLanding = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navLinks = ["Generation", "Evaluation", "About", "FAQ", "Updates"];

  return (
    // OUTER CONTAINER:
    // 1. sticky top-6: Makes it stick 24px (1.5rem) from the top
    // 2. z-50: Ensures it stays on top of hero content
    // 3. px-4: Adds some safety margin on mobile screens
    <header className="fixed top-6 left-0 right-0 z-50 w-full px-4">
      
      {/* INNER CONTAINER (The actual "Floating" Bar):
          1. max-w-[1200px] + mx-auto: Limits width to 1200 and centers it
          2. bg-white/80 + backdrop-blur: Gives the modern "glass" effect
          3. rounded-2xl: Rounds the corners to look "floating"
          4. shadow-sm + border: Adds depth 
      */}
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between rounded-2xl border border-white/10 bg-black/50 px-6 shadow-sm backdrop-blur-md transition-all">
        
        {/* LEFT: Logo & Brand Name */}
        <Link href="/" className="flex items-center gap-2">
          {/* Logo Image */}
          <div className="relative h-8 w-8">
             {/* Make sure you have public/images/logo-icon.png */}
            <Image 
              src="/images/logo-icon.png" 
              alt="Scriptoplay Logo" 
              width={50}  // Slightly larger rendered size (40px)
              height={50} 
              quality={100} // Force high quality
              priority // Loads immediately, crucial for LCP
              className="h-8 w-auto object-contain" // Keeps it visually 32px high, but high res
            />
          </div>
          {/* Brand Name - Font is inherited from body (Outfit), added tracking for style */}
          <span className="text-xl font-bold tracking-tight text-white">
            Scriptoplay
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <Link key={link} href={`#${link.toLowerCase()}`} className="text-md font-medium text-white hover:text-gray-400 transition-colors tracking-wide">
              {link}
            </Link>
          ))}
        </div>

        {/* Action Button using ArrowIcon from your file */}
        <div className="hidden md:block">
          <Link href="/signup" className=" text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 shadow-2xl bg-gradient-to-r from-[#DD136A] to-[#482C5C]">
            Get Started
             {/* Using your custom ArrowIcon */}
            <ArrowIcon className="w-4 h-4 stroke-white group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

         {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white">
            {isOpen ? (
              <XIcon className="w-6 h-6 fill-white" />
            ) : (
              // Inline Menu Icon
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-black border-b border-white/10 p-4 space-y-4">
           {navLinks.map((link) => (
            <Link key={link} href={`#${link.toLowerCase()}`} className="block text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>
              {link}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default NavbarLanding;