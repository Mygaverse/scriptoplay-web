'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { ICONS } from '@/config/icons';
import { motion, AnimatePresence } from 'framer-motion';
// Layout components
import RightPanel from '@/components/dashboard/layout/RightPanel';
import LoglinePhase from '@/components/dashboard/workspace/LoglinePhase';
import SynopsisPhase from '@/components/dashboard/workspace/SynopsisPhaseNew';

const PHASES = [
  { id: 'logline', label: 'Logline', step: 1 },
  { id: 'synopsis', label: 'Synopsis', step: 2 },
  { id: 'treatment', label: 'Treatment', step: 3 },
  { id: 'outline', label: 'Outline', step: 4 },
  { id: 'draft', label: 'Draft', step: 5 },
];

const MainEditorInternal = ({ phase, setPhase, isGenerated, initialLogline, isMagicMode }: any) => {

   // --- STATE LIFTED HERE ---
   // We initialize state with initialLogline, but allow updates
   const [loglineText, setLoglineText] = useState(isGenerated ? initialLogline : "");

   // Only reset if initialLogline *changes* (e.g. from URL param change), not on every render
   React.useEffect(() => {
     if (isGenerated) setLoglineText(initialLogline);
   }, [initialLogline, isGenerated]);
   
   return (
     <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0 bg-[#0a0a0a]">
        
        {/* 1. TOP TABS */}
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
                    {index < PHASES.length - 1 && (
                      <div className={`flex-1 h-0.5 min-w-[20px] mx-2 ${isPast ? 'bg-purple-900/50' : 'bg-[#1a1a1a]'}`} />
                    )}
                  </React.Fragment>
                );
              })}
           </div>
        </div>

        {/* 2. SCROLLABLE CANVAS - PAGE SCROLL, NOT CONTENT STRETCH */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 scrollbar-thin scrollbar-thumb-zinc-800">
           <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                  {/* Phase 1: Logline */}
                  {phase === 'logline' && (
                    <LoglinePhase 
                      value={loglineText} // Pass current state
                      onChange={setLoglineText} // Allow updating state
                      isGenerated={isGenerated}
                      isMagicMode={isMagicMode}
                      onNext={() => setPhase('synopsis')}
                    />
                  )}

                  {/* Phase 2: Synopsis */}
                  {phase === 'synopsis' && (
                    <SynopsisPhase 
                      logline={loglineText} // Pass the persisted state
                      onNext={() => setPhase('treatment')} // Mock next step
                      onBack={() => setPhase('logline')}
                    />
                  )}
                  
                  {/* Locked Phases */}
                  {['treatment', 'outline', 'draft'].includes(phase) && (
                    <div className="flex flex-col items-center justify-center pt-20 text-gray-500">
                        <div className="w-16 h-16 bg-[#141414] rounded-full flex items-center justify-center mb-4">
                          <Icon icon={ICONS.lock} size={24} />
                        </div>
                        <h2 className="text-lg font-medium text-white">Phase Locked</h2>
                    </div>
                  )}

              </motion.div>
           </AnimatePresence>
        </div>
     </div>
   );
};

const WorkspaceLayout = () => {
  const searchParams = useSearchParams();
  const source = searchParams.get('source');
  const isGenerated = source === 'blender';
  const initialLogline = "In a futuristic Mars Colony, a retired Cyborg discovers an ancient Saxophone that controls the city's power grid. He must protect it from the corporation that built him.";

  const [currentPhase, setCurrentPhase] = useState<string>('logline');
  const [isMagicMode, setMagicMode] = useState(false);

  return (
    <div className="flex w-full h-full overflow-hidden bg-[#0a0a0a]">
       <MainEditorInternal 
          phase={currentPhase}
          setPhase={setCurrentPhase}
          isGenerated={isGenerated}
          initialLogline={isGenerated ? initialLogline : ""}
          isMagicMode={isMagicMode}
       />
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