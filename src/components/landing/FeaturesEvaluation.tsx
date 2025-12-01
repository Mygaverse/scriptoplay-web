"use client";
import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn'; 
import RevealAnimation from '../animation/RevealAnimation';

const FeaturesEvaluation = () => {
  // Placeholder text for the script animation
  const scriptLines = [
    "INT. FUTURE LAB - NIGHT",
    "Sparks fly as AVA (20s) welds the final joint.",
    "She lifts her goggles, revealing tired eyes.",
    "AVA",
    "It's done. The system is online.",
    "A low HUM begins to vibrate the floor.",
    "The monitor flickers: 'HELLO WORLD'."
  ];

  return (
    <section id="evaluation" className="py-24 bg-white text-gray-900 border-t border-gray-100">
      
      {/* --- CUSTOM ANIMATIONS --- */}
      <style jsx global>{`
        /* 1. Progress Bar Slider (Left to Right) */
        @keyframes progress-slide {
          0% { left: -30%; }
          100% { left: 130%; }
        }
        .animate-progress {
          animation: progress-slide 2s ease-in-out infinite;
        }

        /* 2. Line-by-Line Reveal (Down to Up) */
        @keyframes line-reveal {
          0% { 
            opacity: 0; 
            transform: translateY(10px); /* Start slightly below */
          }
          10% { 
            opacity: 1; 
            transform: translateY(0); /* Move to position */
          }
          90% { 
            opacity: 1; 
            transform: translateY(0); /* Stay visible */
          }
          100% { 
            opacity: 0; 
            transform: translateY(-5px); /* Fade out slightly up for reset */
          }
        }
        .animate-line-reveal {
          /* Total loop time 8s */
          animation: line-reveal 8s ease-out infinite; 
          opacity: 0; /* Ensures it is hidden before delay starts */
        }

        /* 3. Bar Chart Growing (One by One) */
        @keyframes grow-bar {
          0% { transform: scaleY(0); }
          20% { transform: scaleY(1); }
          80% { transform: scaleY(1); } 
          100% { transform: scaleY(0); } 
        }
        .animate-grow-bar {
          transform-origin: bottom; 
          animation: grow-bar 3s ease-out infinite;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4">
        
        {/* HEADER */}
        <div className="text-center mb-16">
          <RevealAnimation delay={0.3} direction="down" duration={1.2} offset={60}>
            <span className="inline-block px-4 py-2 rounded-xl border border-[#a22070] text-[#a22070] text-sm font-medium mb-4 tracking-wider">
              Exclusive Features: Evaluation
            </span>
          </RevealAnimation>
          <RevealAnimation delay={0.4} direction="down" duration={1.2} offset={60}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">Evaluate Your Script with Confidence</h2>
          </RevealAnimation>
          <RevealAnimation delay={0.5} direction="down" duration={1.2} offset={60}>
            <p className="max-w-3xl mx-auto text-lg font-medium text-gray-500">
              Get beyond spell checks. Scriptoplay’s evaluation engine delivers intelligent feedback on structure, pacing, dialogue, and character arcs.
            </p>
          </RevealAnimation>
        </div>

        {/* CARD GRID */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* --- CARD 1: SCRIPT EVALUATION --- */}
          <RevealAnimation delay={0.7} direction="left" duration={1.2} offset={50}>
            <FeatureCard 
               title="Script Evaluation with Score Feedback"
               desc="Receive detailed evaluations across categories like plot coherence, dialogue strength, character development, and pacing."
               visual={
                 <div className="h-64 bg-gray-200/80 rounded-xl p-3 flex gap-3 text-[10px] text-gray-500 overflow-hidden relative">
                    
                    {/* PANEL 1: SIDEBAR (Static) */}
                    <div className="w-1/4 flex flex-col gap-2 pt-2">
                       <div className="h-2 w-1/2 bg-gray-400/30 rounded mb-2"></div>
                       <div className="bg-[#a22070] text-white p-1.5 rounded text-center shadow-md">Evaluation</div>
                       {['Synopsis', 'Treatment', 'Outlines', 'Scenes'].map((item, i) => (
                         <div key={i} className="px-2 py-1 text-gray-400">{item}</div>
                       ))}
                    </div>

                    {/* PANEL 2: CENTER (Line by Line Text Reveal) */}
                    <div className="w-1/2 bg-gray-300/40 rounded-lg border border-gray-400/20 relative overflow-hidden shadow-inner flex flex-col">
                        {/* macOS dots */}
                        <div className="flex gap-1 p-2 border-b border-gray-400/10 bg-gray-400/10">
                           <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                           <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                           <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                        </div>
                        
                        {/* Real Text Container */}
                        <div className="p-3 space-y-1.5 overflow-hidden flex-1">
                           {scriptLines.map((line, index) => (
                             <div key={index} className="overflow-hidden">
                               <p 
                                 className="animate-line-reveal font-mono text-[10px] leading-tight text-gray-600 dark:text-gray-200"
                                 // Stagger delays: Each line waits 0.5s after the previous one
                                 style={{ animationDelay: `${index * 0.8}s` }}
                               >
                                 {line}
                               </p>
                             </div>
                           ))}
                        </div>
                    </div>

                    {/* PANEL 3: RIGHT (Score & Progress Bar) */}
                    <div className="w-1/4 bg-gray-300/50 rounded-lg flex flex-col items-center justify-center gap-3 p-2 text-center border border-white/50">
                        <span className="text-gray-500 text-[9px]">Overall:</span>
                        <span className="text-2xl font-bold text-[#a22070]">48.9%</span>
                        
                        {/* Progress Bar with Motion */}
                        <div className="w-full h-1 bg-gray-300 rounded-full overflow-hidden relative">
                           <div className="absolute top-0 h-full w-1/3 bg-[#a22070] rounded-full animate-progress"></div>
                        </div>

                        <p className="text-[7px] leading-tight text-gray-400 mt-1">
                           Overall now you have 48.9% better system as compared to previous week.
                        </p>
                        
                        <div className="bg-[#dba2c8] text-white w-full py-1.5 rounded mt-auto font-medium shadow-sm">
                           Export
                        </div>
                    </div>
                 </div>
               }
            />
          </RevealAnimation>
           
          {/* --- CARD 2: DASHBOARD --- */}
          <RevealAnimation delay={0.7} direction="right" duration={1.2} offset={50}>
            <FeatureCard 
               title="Script Insights Dashboard & Reports"
               desc="Visualize your script’s structure, emotional rhythm, and act balance. Track improvements with version comparisons."
               visual={
                 <div className="h-64 bg-gray-200/80 rounded-xl p-3 flex gap-3 text-[10px] text-gray-500 overflow-hidden">
                    
                    {/* PANEL 1: SIDEBAR (Icons) */}
                    <div className="w-1/4 flex flex-col gap-2 pt-2">
                       <div className="flex items-center gap-1 opacity-50"><div className="w-1.5 h-1.5 rounded-full bg-green-400"></div> Generating...</div>
                       <div className="mt-2 space-y-2">
                          <div className="bg-[#a22070] text-white p-1.5 rounded shadow-md flex gap-1 items-center">
                            <span className="w-2 h-2 border border-white rounded-[1px]"></span> Financial...
                          </div>
                          {['Market Ana...', 'Investor Per...', 'Pitch Deck'].map((item, i) => (
                             <div key={i} className="flex gap-1 items-center opacity-60 px-1">
                               <span className="w-2 h-2 border border-gray-500 rounded-[1px]"></span> {item}
                             </div>
                          ))}
                       </div>
                    </div>

                    {/* PANEL 2: DASHBOARD CHARTS (Bar Animation) */}
                    <div className="w-1/2 flex flex-col gap-2">
                       <div className="bg-gray-400/40 rounded-lg h-1/2 p-2 relative flex items-end justify-center gap-2 border border-gray-400/20 shadow-inner">
                          {/* macOS dots */}
                          <div className="absolute top-2 left-2 flex gap-1">
                             <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                             <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                          </div>
                          
                          {/* Animated Bars - Staggered Delays */}
                          <div className="w-3 bg-gray-300 rounded-t-sm h-[40%] animate-grow-bar" style={{ animationDelay: '0s' }}></div>
                          <div className="w-3 bg-gray-300 rounded-t-sm h-[60%] animate-grow-bar" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-3 bg-gray-300 rounded-t-sm h-[30%] animate-grow-bar" style={{ animationDelay: '0.4s' }}></div>
                          {/* The Pink Bar */}
                          <div className="w-3 bg-[#a22070] rounded-t-sm h-[70%] animate-grow-bar" style={{ animationDelay: '0.6s' }}></div>
                       </div>
                       
                       {/* Bottom chart placeholder */}
                       <div className="bg-gray-400/40 rounded-lg h-1/2 p-2 border border-gray-400/20 flex gap-2 items-center">
                          <div className="w-1/2 space-y-1">
                             <div className="h-0.5 w-full bg-white/50"></div>
                             <div className="h-0.5 w-full bg-white/50"></div>
                             <div className="h-0.5 w-full bg-white/50"></div>
                          </div>
                          <div className="w-1/2 h-full flex items-center justify-center">
                             <div className="w-0.5 h-full bg-white/20 rotate-45"></div>
                          </div>
                       </div>
                    </div>

                    {/* PANEL 3: RIGHT (Text Lines) */}
                    <div className="w-1/4 bg-gray-400/30 rounded-lg p-2 border border-white/50">
                       <div className="mb-2 text-white">Script-Insights</div>
                       <div className="space-y-1.5">
                          {[1,2,3,4,5,6,7].map(i => (
                             <div key={i} className="h-0.5 w-full bg-white/40 rounded"></div>
                          ))}
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

// --- FEATURE CARD COMPONENT ---
const FeatureCard = forwardRef(({ title, desc, visual, className }: any, ref: any) => (
  <div 
    ref={ref}
    className={cn("bg-gray-50 border border-gray-100 p-8 rounded-2xl hover:border-gray-200 shadow-lg transition-colors hover:shadow-xl transition-shadow duration-300", className)}
  >
    <div className="mb-6">{visual}</div>
    <div className="flex items-center gap-2 mb-2">
      <h3 className="text-xl font-bold">{title}</h3>
    </div>
    <p className="text-gray-500 text-md leading-relaxed">{desc}</p>
  </div>
));

FeatureCard.displayName = "FeatureCard";

export default FeaturesEvaluation;