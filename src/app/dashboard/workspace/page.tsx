'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { ICONS } from '@/config/icons';
import  Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from '@/components/ui/LoadingScreen';
// Layout components
import RightPanel from '@/components/dashboard/layout/RightPanel';
import LoglinePhase from '@/components/dashboard/workspace/LoglinePhase';
import SynopsisPhase from '@/components/dashboard/workspace/SynopsisPhase';
// Hook and types
import { useProject } from '@/hooks/useProject'; // Import hook
import { aiService } from '@/services/aiService';


const PHASES = [
  { id: 'logline', label: 'Logline', step: 1 },
  { id: 'synopsis', label: 'Synopsis', step: 2 },
  { id: 'treatment', label: 'Treatment', step: 3 },
  { id: 'outline', label: 'Outline', step: 4 },
  { id: 'draft', label: 'Draft', step: 5 },
];

const MainEditorInternal = ({ 
  phase, setPhase, isGenerated, isMagicMode, 
  projectData, 
  onSave, 
  onSaveDraft, 
  versions
}: any) => {

   // --- STATE LIFTED HERE ---
   // We initialize state with initialLogline, but allow updates
   const [loglineText, setLoglineText] = useState("");

   // STATE: Synopsis & Modules (Lifted)
   const [synopsisData, setSynopsisData] = useState({ intro: "", plot: "", resolution: "" });
   const [characters, setCharacters] = useState<any[]>([]);
   const [settings, setSettings] = useState<any[]>([]);
   const [themes, setThemes] = useState<any[]>([]);
   const [plots, setPlots] = useState<any[]>([]); 
   
   const [isGenerating, setIsGenerating] = useState(false);

   // Sync when projectData loads/changes
   useEffect(() => {
     if (projectData) {
        if (projectData.logline) setLoglineText(projectData.logline);
        // If saved synopsis/modules before, load them here
        if (projectData.synopsis) setSynopsisData(projectData.synopsis);
        // ... load modules if saved ...
     }
   }, [projectData]);

   // --- THE GENERATOR FUNCTION ---
   const generateSynopsisData = async (logline: string, isMagicPolish = false) => {
     if (!logline) return;
     setIsGenerating(true);

     try {
        const prompt = `
            Act as a professional screenwriter.
            Logline: "${logline}"
            
            ${isMagicPolish ? 'Refine the existing story structure.' : 'Create a detailed synopsis and extract script elements.'}

            Generate JSON:
            {
              "intro": "Introduction text...",
              "plot": "Plot summary text...",
              "resolution": "Resolution text...",
              "characters": [ { "name": "Name", "role": "Role", "age": "Age", "desc": "Short desc" } ],
              "settings": [ { "name": "Location Name", "type": "Int/Ext", "vibe": "Adjective" } ],
              "themes": [ "Theme1", "Theme2" ],
              "plots": [ { "title": "Subplot Title", "type": "Subplot", "desc": "Brief description" } ]
            }
        `;
        
        const result = await aiService.generateStructured(prompt);

        // Update State
        setSynopsisData({ intro: result.intro, plot: result.plot, resolution: result.resolution });
        if (Array.isArray(result.characters)) setCharacters(result.characters);
        if (Array.isArray(result.settings)) setSettings(result.settings);
        if (Array.isArray(result.themes)) setThemes(result.themes.map((t: string) => ({ name: t, color: 'bg-purple-500' })));
        if (Array.isArray(result.plots)) setPlots(result.plots);

        // If called from Logline Phase, Auto-Advance
        if (!isMagicPolish) {
            setPhase('synopsis');
        }

     } catch (error) {
        console.error(error);
        alert("Generation failed.");
     } finally {
        setIsGenerating(false);
     }
   };

   
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
                    <>
                    <LoglinePhase 
                      value={loglineText} // Pass current state
                      onChange={setLoglineText}
                      isGenerated={isGenerated}
                      isMagicMode={isMagicMode}
                      onNext={() => {
                         onSave({ logline: loglineText }); // Save before moving
                         setPhase('synopsis');
                      }}
                      // Pass Generator
                      onGenerateSynopsis={() => generateSynopsisData(loglineText)}
                      isGenerating={isGenerating}
                      // VERSIONING PROPS
                      // Inside MainEditorInternal
                      onSaveDraft={() => onSaveDraft('logline', { ...projectData, logline: loglineText })}
                      versions={versions}
                    />
                    </>
                  )}

                  {/* Phase 2: Synopsis */}
                  {phase === 'synopsis' && (
                    <SynopsisPhase 
                      logline={loglineText} // Pass the persisted state
                      onNext={() => setPhase('treatment')} // Mock next step
                      onBack={() => setPhase('logline')}

                      // DATA PROPS
                      synopsisData={synopsisData} setSynopsisData={setSynopsisData}
                      characters={characters} setCharacters={setCharacters}
                      settings={settings} setSettings={setSettings}
                      themes={themes} setThemes={setThemes}
                      plots={plots} setPlots={setPlots} // New

                      // ACTIONS
                      onMagicPolish={() => generateSynopsisData(loglineText, true)}
                      isGenerating={isGenerating}
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
  const projectId = searchParams.get('id'); // Get ID from URL
  // Use the custom hook to manage project data
  const source = searchParams.get('source');
  const isGenerated = source === 'blender';

  // USE THE HOOK
  const { project, loading, saveProject, saveDraft, versions } = useProject(projectId, source ?? undefined);

  const [currentPhase, setCurrentPhase] = useState<string>('logline');
  const [isMagicMode, setMagicMode] = useState(false);

  if (loading) return <LoadingScreen message="Loading Project..." />;

  return (
    <div className="flex w-full h-full overflow-hidden bg-[#0a0a0a]">
       <MainEditorInternal 
          phase={currentPhase}
          setPhase={setCurrentPhase}
          isGenerated={isGenerated}
          isMagicMode={isMagicMode}
          // Pass Data Down
          projectData={project?.data}
          onSave={saveProject}
          onSaveDraft={saveDraft}
          versions={versions}
       />
       <RightPanel isMagicMode={isMagicMode} setMagicMode={setMagicMode} />
    </div>
  );
};

export default function WorkspacePage() {
  return (
    <Suspense fallback={<LoadingScreen message="Initializing Workspace..." />}>
      <WorkspaceLayout />
    </Suspense>
  );
}