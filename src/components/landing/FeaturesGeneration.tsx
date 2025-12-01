"use client";
import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn'; 
import RevealAnimation from '../animation/RevealAnimation';

// --- 1. NEW: The SVG Traveling Beam Button ---
// This uses an SVG rectangle to draw a line that physically follows the border radius
// --- 1. NEW: Conic Gradient Beam Button ---
const BorderBeamButton = ({ text, icon }: { text: string; icon?: React.ReactNode }) => {
  return (
    // P-[2px] defines the thickness of the beam (the gap between container and content)
    <div className="relative group cursor-pointer w-full rounded-lg overflow-hidden p-[2px]">
      
      {/* LAYER A: The Glow Effect (Blurred) */}
      <div className="absolute inset-[-100%] animate-[spin_5s_linear_infinite] 
        bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_75%,#60a5fa_100%)] 
        blur-md opacity-80" 
      />

      {/* LAYER B: The Sharp Beam (Visible Line) */}
      <div className="absolute inset-[-100%] animate-[spin_5s_linear_infinite] 
        bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_75%,#60a5fa_100%)]" 
      />
      
      {/* LAYER C: The Button Content (Solid background masks the center) */}
      <div className="relative h-full bg-[#9d3b79] text-white px-4 py-2 rounded-[6px] flex items-center justify-between shadow-sm z-10 hover:bg-[#8c346b] transition-colors">
        <span className="text-sm font-medium">{text}</span>
        {icon}
      </div>
    </div>
  );
};

// --- Main Section Component ---

const FeaturesGeneration = () => {
  return (
    <section id="generation" className="py-24 bg-gray-50 dark:bg-white text-gray-900">
      
      {/* CUSTOM ANIMATION STYLES */}
      <style jsx global>{`
        /* 1. Progress Bar Animation (Card 3) */
        @keyframes progress-slide {
          0% { left: -30%; }
          100% { left: 130%; }
        }
        .animate-progress {
          animation: progress-slide 2s ease-in-out infinite;
        }

        /* 2. Border Beam Animation (Buttons) */
        /* Moves the stroke-dashoffset to animate the SVG line around the box */
        @keyframes beam-crawl {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -100; }
        }
        .animate-beam-crawl {
          animation: beam-crawl 3s linear infinite;
        }
      `}</style>

      <div className="main-container max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <RevealAnimation delay={0.3} direction="down" duration={1.2} offset={60}>
            <span className="inline-block px-4 py-2 rounded-xl border border-[#a22070] text-[#a22070] text-sm font-medium mb-4 tracking-wider">
              Exclusive Features: Generation
            </span>
          </RevealAnimation>
          <RevealAnimation delay={0.4} direction="down" duration={1.2} offset={60}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">
              Generate Your Script with AI Precision
            </h2>
          </RevealAnimation>
          <RevealAnimation delay={0.5} direction="down" duration={1.2} offset={60}>
            <p className="max-w-3xl mx-auto text-lg font-medium text-gray-500">
              Scriptoplay’s generation engine helps you go from a spark of inspiration to a fully structured screenplay.
            </p>
          </RevealAnimation>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Card 1: Genre-Aware Copilot */}
          <RevealAnimation delay={0.7} direction="left" duration={1.2} offset={50}>
            <FeatureCard 
              title="Genre-Aware Copilot"
              desc="Whether it's thriller, drama, or rom-com, our AI adjusts tone, pacing, and structure to match industry standards."
              visual={
                <div className="bg-gray-100 p-4 rounded-xl h-40 flex flex-col justify-between relative overflow-hidden">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-300/50"></div>
                      <div className="flex-1 space-y-2">
                         <div className="h-2 w-3/4 bg-gray-300/50 rounded"></div>
                         <div className="h-2 w-1/2 bg-gray-300/50 rounded"></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-300/50"></div>
                      <div className="flex-1 space-y-2">
                         <div className="h-2 w-3/4 bg-gray-300/50 rounded"></div>
                         <div className="h-2 w-1/2 bg-gray-300/50 rounded"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <BorderBeamButton 
                      text="Script Elements" 
                      icon={
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      } 
                    />
                  </div>
                </div>
              }
            />
          </RevealAnimation>

          {/* Card 2: Idea & Scene Generator */}
          <RevealAnimation delay={0.7} direction="down" duration={1.2} offset={50}>
            <FeatureCard 
              title="Idea & Scene Generator"
              desc="Start with an idea or logline and let our AI guide you through plot development, scene structuring, and character dialogue."
              visual={
                <div className="bg-gray-100 p-4 rounded-xl h-40 flex flex-col items-center justify-between">
                   {/* Top Input Mockup */}
                   <div className="w-full bg-gray-300/40 h-8 rounded-md mb-2 flex items-center px-2">
                     <div className="w-1/3 h-2 bg-white/50 rounded"></div>
                   </div>
                   
                   {/* Center Button with BEAM */}
                   <div className="w-1/2">
                     <BorderBeamButton text="Generate" />
                   </div>

                   {/* Bottom Grid Mockup */}
                   <div className="w-full grid grid-cols-3 gap-2 mt-2">
                     {[1,2,3].map(i => (
                       <div key={i} className="h-12 bg-gray-200 rounded-md border border-white/50 flex flex-col p-1 gap-1">
                          <div className="w-4 h-4 rounded bg-gray-300/50"></div>
                          <div className="w-full h-1 bg-gray-300/50 rounded"></div>
                       </div>
                     ))}
                   </div>
                </div>
              }
            />
          </RevealAnimation>

          {/* Card 3: AI-Assisted Formatting */}
          <RevealAnimation delay={0.7} direction="right" duration={1.2} offset={50}>
            <FeatureCard 
              title="AI-Assisted Formatting"
              desc="Automatically format your scripts to industry standards with better rhythm, emotion, or tone based on your intent."
              visual={
                <div className="bg-gray-100 rounded-xl h-40 overflow-hidden relative flex text-[12px]">
                   {/* Header Bar */}
                   <div className="absolute top-0 w-full h-4 bg-gray-400/30 flex gap-1 px-2 items-center">
                     <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                     <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                     <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                   </div>

                   {/* Sidebar */}
                   <div className="w-2/5 bg-gray-400/20 pt-6 px-2 space-y-2">
                      <div className="flex items-center gap-1 opacity-50"><div className="w-3 h-3 border border-gray-500 rounded-sm"></div><span>Script Scan</span></div>
                      
                      {/* Active Sidebar Item */}
                      <div className="bg-[#a22070] text-white p-1 rounded-md shadow-sm flex items-center gap-1">
                        <div className="w-3 h-3 border border-white rounded-sm flex items-center justify-center text-[8px]">✓</div>
                        <span>Script Space</span>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-50"><div className="w-3 h-3 border border-gray-500 rounded-sm"></div><span>Script Blender</span></div>
                      <div className="flex items-center gap-1 opacity-50"><div className="w-3 h-3 border border-gray-500 rounded-sm"></div><span>Script Copilot</span></div>
                   </div>

                   {/* Main Content Area */}
                   <div className="w-3/5 bg-gray-300/50 pt-4 px-3 flex flex-col items-center justify-center">
                      <div className="w-full h-32 bg-gray-400/20 rounded-lg border border-gray-400/30 flex flex-col items-center justify-center gap-2">
                          <span className="text-gray-500">Status</span>
                         {/* ROTATING ICON (Clockwise Spin) */}
                         <div className="animate-spin text-[#a22070]">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                               <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                         </div>
                         
                         {/* PROGRESS BAR (Pink portion moves left to right) */}
                         <div className="w-3/4 h-1.5 bg-gray-300 rounded-full overflow-hidden relative">
                            <div className="absolute top-0 h-full w-1/3 bg-[#a22070] rounded-full animate-progress"></div>
                         </div>
                         <span className="text-gray-500">Scanning...</span>
                      </div>
                   </div>
                </div>
              }
            />
          </RevealAnimation>
        </div>
      </div>
    </section>
  );
};

// --- Corrected FeatureCard Component ---
const FeatureCard = forwardRef(({ title, desc, visual, className }: any, ref: any) => (
  <div 
    ref={ref}
    className={cn("bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 h-full flex flex-col", className)}
  >
    <div className="mb-6">{visual}</div>
    <div className="flex items-center gap-2 mb-2">
      <h3 className="text-xl font-bold">{title}</h3>
    </div>
    <p className="text-gray-500 text-md leading-relaxed">{desc}</p>
  </div>
));

FeatureCard.displayName = "FeatureCard";

export default FeaturesGeneration;