"use client";

import Link from 'next/link';
import Image from "next/image";


// Using inline Play SVG since we don't have it in your custom icon set
const PlayIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 3L19 12L5 21V3Z" />
    </svg>
);

const FooterLanding = () => {
  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-8 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand Info */}
          <div className="md:col-span-2">
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
            <p className="text-gray-400 text-sm mt-5 leading-relaxed max-w-xs">
              Your trusted partner in AI solutions, creating smarter systems for smarter businesses.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h6 className="text-white/60 font-bold mb-6">Navigation</h6>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="#generation" className="hover:text-white transition-colors">Generation</Link>
              </li>
              <li>
                <Link href="#evaluation" className="hover:text-white transition-colors">Evaluation</Link>
              </li>
              <li>
                <Link href="#about" className="hover:text-white transition-colors">About</Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-white transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Access */}
          <div>
            <h6 className="text-white/60 font-bold mb-6">Quick Access</h6>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">Sign Up</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">Updates</Link>
              </li>
            </ul>
          </div>
        </div>

         {/* 2. FULL WIDTH BOTTOM BAR */}
          {/* 
              This div is outside the max-w-7xl container, so the border 
              stretches properly from edge to edge.
          */}
          <div className="w">
            {/* Inner container aligns the text with the rest of the page */}
            <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center text-xs">
              <p className='text-white/60'>@2025 Scriptoplay</p>
              <p className='text-white/60 pr-50'>© All rights reserved</p>
            </div>
          </div>
      </div>
    </footer>
  );
};

export default FooterLanding;