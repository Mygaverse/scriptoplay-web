'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ICONS } from '@/config/icons';
import { motion, AnimatePresence } from 'framer-motion';
// Layout components
import RightPanel from '@/components/dashboard/layout/RightPanel'; // Ensure this path is correct
import MagicLogline from '@/components/dashboard/workspace/MagicLogline'; // Ensure this path is correct
import classNames from 'classnames';

// --- Configuration ---
const PHASES = [
  { id: 'logline', label: 'Logline', step: 1 },
  { id: 'synopsis', label: 'Synopsis', step: 2 },
  { id: 'treatment', label: 'Treatment', step: 3 },
  { id: 'outline', label: 'Outline', step: 4 },
  { id: 'draft', label: 'Draft', step: 5 },
];

// --- Main Editor Component ---
const MainEditorInternal = ({ phase, setPhase, isGenerated, initialLogline, isMagicMode }: any) => {
   const [loglineText, setLoglineText] = useState(initialLogline);
   const maxWords = 50; // Loglines should be very short (~30-50 words usually), set to 50 constraint
   
   // Sync state if props change
   useEffect(() => {
     setLoglineText(initialLogline);
   }, [initialLogline]);

    // Word Count Logic
   const wordCount = loglineText.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
   const isOverLimit = wordCount > maxWords;

   // Mock Generation Handler
  const handleGenerateNext = () => {
    // In real app, this would call API
    // For MVP UI demo, just switch tabs
    if (phase === 'logline') setPhase('synopsis');
  };

   return (
     // h-full ensures it fills vertical space. min-w-0 prevents flexbox overflow.
     <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0 relative bg-[#0a0a0a]">
        
        {/* 1. TOP TABS (Restored) */}
        <div className="h-20 border-b border-[#262626] flex items-center px-8 bg-[#0a0a0a] shrink-0 overflow-x-auto no-scrollbar">
           <div className="flex items-center gap-2 w-full max-w-4xl mx-auto">
              {PHASES.map((p, index) => {
                const isActive = phase === p.id;
                const isPast = PHASES.findIndex(ph => ph.id === phase) > index;
                return (
                  <React.Fragment key={p.id}>
                    <button 
                      onClick={() => setPhase(p.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        isActive 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40 ring-1 ring-purple-400' 
                        : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        isActive ? 'bg-white text-purple-600 font-bold' : isPast ? 'bg-purple-500 text-black' : 'bg-[#262626]'
                      }`}>
                        {isPast ? <Icon icon={ICONS.checkCircle} size={32} /> : p.step}
                      </span>
                      <span className="whitespace-nowrap">{p.label}</span>
                    </button>
                    {/* Connector Line */}
                    {index < PHASES.length - 1 && (
                      <div className={`flex-1 h-0.5 min-w-[20px] mx-2 ${isPast ? 'bg-purple-900/50' : 'bg-[#1a1a1a]'}`} />
                    )}
                  </React.Fragment>
                );
              })}
           </div>
        </div>

        {/* 2. SCROLLABLE CANVAS */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 scrollbar-thin scrollbar-thumb-zinc-800">
           <div className="max-w-3xl mx-auto min-h-full flex flex-col pb-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col"
                >
                {/* --- LOGLINE PHASE --- */}
                {phase === 'logline' && (
                <>
                  <div className="text-left mb-8 mt-4">
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {isGenerated ? "Generated Logline" : "Write your Logline"}
                    </h1>
                    <p className="text-gray-400">
                      {isGenerated ? "This concept was blended by AI. Use the tools to refine it." : "Start your story from a single sentence."}
                    </p>
                  </div>
                  <div className="flex items-center justify-end mb-4">
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" icon={ICONS.refresh}>Regenerate New</Button>
                        <Button variant="primary" size="sm">Create Variants</Button>
                    </div>
                  </div>

                  {/* Editor Box */}
                  <div className="relative group flex flex-col">
                    {/* Glowing border if generated/locked */}
                    {isGenerated && <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl opacity-30 blur"></div>}
                    
                    <div className={`relative border rounded-xl p-1 transition-colors h-full ${
                      isGenerated ? 'bg-[#0f0f0f] border-purple-500/30' : 'bg-[#141414] border-[#262626]'
                    }`}>
                      {isGenerated ? (
                          <MagicLogline text={loglineText} isMagicMode={isMagicMode} />
                      ) : (
                          <textarea 
                            value={loglineText}
                            onChange={(e) => setLoglineText(e.target.value)}
                            className="w-full bg-[#0a0a0a] rounded-lg p-6 text-xl text-gray-200 placeholder-gray-600 outline-none resize-none min-h-[200px] leading-relaxed"
                            placeholder="e.g. When a killer shark unleashes chaos on a beach community, a local sheriff, a marine biologist, and an old seafarer must hunt the beast down before it kills again."
                          />
                          
                      )}
                      
                      <div className="absolute bottom-4 right-4 flex items-center gap-3">
                          {isGenerated && (
                            <Badge variant="neutral" className="flex items-center gap-1 bg-purple-900/20 text-purple-300 border-purple-500/20">
                              <Icon icon={ICONS.lock} size={10} /> Locked
                            </Badge>
                          )}
                          <div className={`text-xs font-medium text-gray-500" ${
                            isOverLimit ? 'text-red-400 border-red-900/50' : 'text-gray-500'
                          }`}>
                              {wordCount} / {maxWords} Words
                          </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contextual Warning for Generated Content */}
                  {isGenerated && (
                    <div className="mt-4 flex items-start gap-3 p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
                      <Icon icon={ICONS.info} className="text-gray-400 mt-0.5 shrink-0" size={16} />
                      <p className="text-sm text-gray-400">
                        To modify this logline, use the <strong>Script Copilot</strong> on the right. 
                        Direct editing is disabled to preserve the generated token value.
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-8">
                    <Button variant="ghost" size="md">Save as Draft</Button>
                    <Button 
                      variant="primary" 
                      size="lg" 
                      onClick={handleGenerateNext}
                      icon={ICONS.sparkles}
                      disabled={wordCount === 0 || isOverLimit}
                    >
                      Generate Synopsis</Button>
                  </div>
                  </>
                )}

                {/* --- SYNOPSIS PHASE --- */}
                {phase === 'synopsis' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h1 className="text-2xl font-bold text-white">Synopsis</h1>
                          <p className="text-sm text-gray-400">AI-generated draft based on your logline.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm" icon={ICONS.refresh}>Regenerate</Button>
                            <Button variant="primary" size="sm">Accept & Next</Button>
                        </div>
                      </div>

                      <div className="bg-[#141414] border border-[#262626] rounded-xl p-8 min-h-[600px] shadow-2xl">
                        <h2 className="text-3xl font-bold text-white mb-6 border-b border-[#262626] pb-4">Untitled Script</h2>
                        <div className="prose prose-invert max-w-none text-gray-300 leading-8">
                            <p>
                              In the sweltering heat of a Amity Island summer, CHAIEF BRODY finds the remains of a young woman washed ashore. The medical examiner confirms it was a shark attack, but the Mayor, fearing a loss of tourism revenue, demands the beaches stay open.
                            </p>
                            <p>
                              As more victims fall prey to the predator, Brody is forced to team up with HOOPER, a rich oceanographer, and QUINT, a grizzled shark hunter...
                            </p>
                            <p className="text-gray-600 italic">[AI is writing more...]</p>
                        </div>
                      </div>
                  </div>
                )}

                {/* --- LOCKED PHASES --- */}
                {['treatment', 'outline', 'draft'].includes(phase) && (
                  <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                      <div className="w-16 h-16 bg-[#141414] rounded-full flex items-center justify-center mb-4">
                        <Icon icon={ICONS.lock} size={24} />
                      </div>
                      <h2 className="text-lg font-medium text-white">Phase Locked</h2>
                      <p className="text-sm max-w-xs text-center mt-2">Complete the previous steps to unlock the {PHASES.find(p=>p.id===phase)?.label} editor.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
           </div>
        </div>
     </div>
   );
};

// --- Layout Wrapper ---
const WorkspaceLayout = () => {
  const searchParams = useSearchParams();
  const source = searchParams.get('source');
  const isGenerated = source === 'blender';
  const initialLogline = "In a futuristic Mars Colony, a retired Cyborg discovers an ancient Saxophone that controls the city's power grid. He must protect it from the corporation that built him.";

  const [currentPhase, setCurrentPhase] = useState<string>('logline');
  const [isMagicMode, setMagicMode] = useState(false);

  return (
    // ROOT FLEX CONTAINER: Fills the DashboardShell
    <div className="flex  w-full h-full overflow-hidden bg-[#0a0a0a]">
       
       {/* LEFT: Editor takes all available space */}
       <MainEditorInternal 
          phase={currentPhase}
          setPhase={setCurrentPhase}
          isGenerated={isGenerated}
          initialLogline={isGenerated ? initialLogline : ""}
          isMagicMode={isMagicMode}
       />

       {/* RIGHT: Panel Fixed Width */}
       <RightPanel isMagicMode={isMagicMode} setMagicMode={setMagicMode} />
       
    </div>
  );
};

export default function WorkspacePage() {
  return (
    <Suspense fallback={<div className="text-white p-10">Loading Workspace...</div>}>
      <WorkspaceLayout />
    </Suspense>
  );
}