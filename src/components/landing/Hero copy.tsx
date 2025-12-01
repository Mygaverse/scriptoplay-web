"use client";  // <--- THIS MUST BE LINE 1

import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/icons";
import { motion } from "framer-motion"; // Import motion
// Update the import path based on where you put the file
import ParticleBackground from "../animation/ParticleBackground"; 

const Hero = () => {
  return (
     // 1. Fixed Height 800px & overflow-visible allows the image to hang out the bottom
    <section className="relative h-[920px] bg-black/85 w-full overflow-visible flex flex-col items-center pt-32 mt-0">
      {/* --- BACKGROUND LAYERS --- */}
      
      {/* Layer 1: The Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.png" // Make sure to add a background image here
          alt="Background"
          fill
          priority
          className="object-cover object-top"
        />
      </div>

      {/* Layer 2: Dim Overlay (Darkens the image so text pops) */}
      <div className="absolute inset-0 z-10 bg-black/15" />

      {/* Layer 3: Particles (Framer Motion) */}
      <ParticleBackground />

      {/* --- FOREGROUND CONTENT --- */}

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 text-center">
         {/* Badge */}
        <span className="inline-block px-4 py-2 rounded-xl border border-[#a22070]/50 bg-black/50 text-gray-400 text-sm font-medium mb-4 tracking-wider">
            News: Only available for Interal Testing
        </span>

        {/* Heading */}
        <h1 className="text-3xl md:text-6xl font-medium tracking-tight mb-6 text-white">
          Transforming script-to-film <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500">
            through the power of AI
          </span>
        </h1>

        {/* Subheading */}
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
          AI-powered editing and analysis tools designed to supercharge your storytelling. From formatting to feedback, Scriptoplay is your creative co-pilot.
        </p>
        
        {/* Action Buttons */}
        <div className="mt-10 mb-10 flex flex-wrap justify-center gap-4">
          <button className="bg-[#a22070] hover:bg-[#851b5c] text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2">
            Get Started
             {/* Using your custom ArrowIcon */}
            <ArrowIcon className="w-4 h-4 stroke-white group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-lg font-medium transition-all">
            How to use Scriptoplay
          </button>
        </div>
      </div>

        {/* --- THE HANGING DASHBOARD IMAGE --- */}
      
        {/* 
          Logic:
          1. absolute bottom-0: Anchors it to bottom of 800px hero
          2. translate-y-1/2: Pushes it down 50% of its own height (centering it on the line)
        */}
        <div className="absolute bottom-0 z-20 w-full max-w-[1000px] px-4 translate-y-1/2">
          <div className="relative aspect-[800/492] w-full overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-[#0f0f0f]">
            {/* Replace this with your actual dashboard screenshot */}
            <Image
              src="/images/dashboard-screenshot.png" 
              alt="Scriptoplay Dashboard"
              fill
              className="object-cover"
            />

            {/* --- EFFECT START --- */}

            {/* 1. The Static Top Stroke (Faint Grey Line) */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20 z-10" />
           
           {/* 2. The Moving Light Beam */}
          <motion.div
            // A. Appearance: Height 1px, Width 150px, Gradient fades to transparent on sides
            className="absolute top-0 z-20 h-[1px] w-[150px] bg-gradient-to-r from-transparent via-blue-400 to-transparent"
            
            // B. Glow Effect: Adds a small blur to make it look like a laser
            style={{ boxShadow: "0 0 10px 1px rgba(96, 165, 250, 0.5)" }} 

            // C. Animation: Start off-screen left (-100%), move to off-screen right (100% of container width +)
            initial={{ left: "-20%" }} 
            animate={{ left: "120%" }} 
            
            transition={{
              duration: 3,         // Speed (3 seconds to cross)
              repeat: Infinity,    // Loop forever
              ease: "linear",      // Constant speed
              repeatDelay: 0.5     // Small pause between loops
            }}
          />
          {/* --- EFFECT END --- */}

          </div>
        </div>

      
    </section>
  );
};

export default Hero;