'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ICONS } from '@/config/icons';

import MagicLogline from '@/components/dashboard/workspace/MagicLogline';
import { aiService } from '@/services/aiService'; // Import AI

// --- Types ---
interface ModuleItem {
  id: string;
  name: string;
  tag: string;
  color: string; // To add visual life
}

interface SynopsisPhaseProps {
  logline: string;
  onNext: () => void;
  onBack: () => void;
}

// --- 1. NARRATIVE TEXT COMPONENT (The Story Flow) ---
const NarrativeSection = ({ 
  title, 
  limit, 
  value, 
  minHeight = "min-h-[180px]", // Default fallback
  icon,
  onChange // Allow parent to update text 
}: { 
  title: string; 
  limit: string; 
  value: string; 
  minHeight?: string; // prop to control height
  icon: string;
  onChange: (val: string) => void;
}) => {
  const [isMagicMode, setMagicMode] = useState(false);
  // We need to sync local state with parent prop 'value'
  // so when AI updates the parent, this box updates too.
  const [text, setText] = useState(value);

  useEffect(() => {setText(value);}, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onChange(e.target.value);
  };

  // Parse Max Limit
  const maxWords = parseInt(limit.split('-')[1]) || 100;
  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const isOverLimit = wordCount > maxWords;

  return (
    <div className={`bg-[#141414] border rounded-xl overflow-hidden flex flex-col transition-all duration-300 ${
        isMagicMode ? 'border-purple-500 ring-1 ring-purple-500/30' : 'border-[#262626]'
    }`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#262626] flex justify-between items-center bg-[#1a1a1a]/50">
          <div className="flex items-center gap-3">
             <Icon icon={icon} size={18} className="text-gray-400" />
             <h3 className="text-[18px] font-bold text-gray-200">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
              <span className="text-[12px] text-gray-500 font-mono mr-2">{limit} Words</span>
              <button 
                onClick={() => setMagicMode(!isMagicMode)}
                className={`p-1.5 rounded transition-colors ${isMagicMode ? 'text-purple-400 bg-purple-900/20' : 'text-gray-500 hover:text-white'}`}
              >
                <Icon icon={ICONS.wand} size={16} />
              </button>
          </div>
      </div>
      
      {/* Content */}
      <div className={` w-full bg-[#0a0a0a] relative ${minHeight}`}>
         {isMagicMode ? (
            <div className="p-4"><MagicLogline text={text} isMagicMode={true} /></div>
         ) : (
            <textarea
                value={text}
                onChange={handleChange}
                className="w-full h-full bg-transparent p-4 text-sm text-gray-300 placeholder-gray-700 outline-none resize-none leading-relaxed focus:bg-[#0f0f0f] transition-colors"
            />
         )}
         <div className="absolute bottom-4 right-4 flex items-center gap-3 pointer-events-none">
            <div className={`text-xs font-medium ${isOverLimit ? 'text-red-400' : 'text-gray-500'}`}>
                {wordCount} / {maxWords} Words
            </div>
        </div>
      </div>
    </div>
  );
};

// --- 2. MODULE: CHARACTER CARDS (Portrait / Cast Style) ---
const CharacterGrid = ({ items, onAdd }: { items: ModuleItem[], onAdd: () => void }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center px-1">
       <h3 className="text-[20px] font-bold text-gray-200 flex items-center gap-2">
         <Icon icon={ICONS.user} size={24} className="text-blue-400"/> Characters
       </h3>
       <button onClick={onAdd} className="text-xs text-blue-400 hover:text-white transition-colors">+ Add</button>
    </div>
    
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
       {items.map((char) => (
         <div key={char.id} className="group relative bg-[#141414] border border-[#262626] rounded-xl p-3 flex flex-col items-center text-center hover:border-blue-500/50 transition-all cursor-pointer">
            {/* Avatar Placeholder with Gradient */}
            <div className={`w-12 h-12 rounded-full mb-3 bg-gradient-to-br ${char.color} shadow-lg flex items-center justify-center text-white font-bold text-lg`}>
               {char.name.charAt(0)}
            </div>
            <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate w-full">{char.name}</span>
            <span className="text-[10px] text-gray-500">{char.tag}</span>
            
            {/* Hover Action */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <Icon icon={ICONS.copilot} size={12} className="text-blue-400" />
            </div>
         </div>
       ))}
       
       {/* Add Button */}
       <button onClick={onAdd} className="border border-dashed border-[#262626] rounded-xl flex flex-col items-center justify-center text-gray-600 hover:text-blue-400 hover:border-blue-500/30 transition-all min-h-[100px]">
          <Icon icon={ICONS.plus} size={24} />
          <span className="text-[12px] mt-1 font-medium">Add Cast</span>
       </button>
    </div>
  </div>
);

// --- 3. MODULE: SETTING CARDS (Landscape / Location Style) ---
const SettingGrid = ({ items, onAdd }: { items: ModuleItem[], onAdd: () => void }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center px-1">
       <h3 className="text-[20px] font-bold text-gray-200 flex items-center gap-2">
         <Icon icon={ICONS.map} size={24} className="text-green-400"/> Settings
       </h3>
       <button onClick={onAdd} className="text-xs text-green-400 hover:text-white transition-colors">+ Add</button>
    </div>

    <div className="grid grid-cols-2 gap-3">
       {items.map((loc) => (
         <div key={loc.id} className="group relative bg-[#141414] border border-[#262626] rounded-xl overflow-hidden hover:border-green-500/50 transition-all cursor-pointer h-24">
            {/* Background Visual Hint */}
            <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${loc.color}`} />
            
            <div className="relative z-10 p-3 h-full flex flex-col justify-end">
               <span className="text-xs font-bold text-white group-hover:text-green-400 transition-colors">{loc.name}</span>
               <span className="text-[10px] text-gray-400">{loc.tag}</span>
            </div>
         </div>
       ))}
       <button onClick={onAdd} className="border border-dashed border-[#262626] rounded-xl flex flex-col items-center justify-center text-gray-600 hover:text-green-400 hover:border-green-500/30 transition-all h-24">
          <Icon icon={ICONS.plus} size={24} />
          <span className="text-[12px] mt-1 font-medium">Add Settings</span>
       </button>
    </div>
  </div>
);

// --- 4. MODULE: THEME CARDS (Abstract / Icon Style) ---
const ThemeGrid = ({ items, onAdd }: { items: ModuleItem[], onAdd: () => void }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center px-1">
       <h3 className="text-[20px] font-bold text-gray-200 flex items-center gap-2">
         <Icon icon={ICONS.fileText} size={24} className="text-orange-400"/> Themes
       </h3>
       <button onClick={onAdd} className="text-xs text-orange-400 hover:text-white transition-colors">+ Add</button>
    </div>

    <div className="space-y-2">
       {items.map((theme) => (
         <div key={theme.id} className="group flex items-center gap-3 p-3 bg-[#141414] border border-[#262626] rounded-xl hover:border-orange-500/50 transition-all cursor-pointer">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${theme.color} flex items-center justify-center shadow-md`}>
               <Icon icon={ICONS.sparkles} size={14} className="text-white mix-blend-overlay" />
            </div>
            <div>
               <div className="text-xs font-bold text-white">{theme.name}</div>
               <div className="text-[10px] text-gray-500">{theme.tag}</div>
            </div>
         </div>
       ))}
       <button onClick={onAdd} className="flex items-center justify-center gap-2 w-full py-2 border border-dashed border-[#262626] rounded-xl text-[12px] text-gray-600 hover:text-orange-400 hover:border-orange-500/30 transition-all">
          <Icon icon={ICONS.plus} size={24} /> Add Theme
       </button>
    </div>
  </div>
);

// --- 5. MODULE: PLOT CARDS ---
const PlotGrid = ({ items, onAdd }: { items: ModuleItem[], onAdd: () => void }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center px-1">
       <h3 className="text-[20px] font-bold text-gray-200 flex items-center gap-2">
         <Icon icon={ICONS.layers} size={24} className="text-red-400"/> Plots
       </h3>
       <button onClick={onAdd} className="text-xs text-red-400 hover:text-white transition-colors">+ Add</button>
    </div>
    <div className="space-y-2">
       {items.map((plot) => (
         <div key={plot.id} className="group flex items-center gap-3 p-3 bg-[#141414] border border-[#262626] rounded-xl hover:border-red-500/50 transition-all cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-[#262626] flex items-center justify-center text-red-400 font-bold text-[10px]">
               ACT
            </div>
            <div>
               <div className="text-xs font-bold text-white">{plot.name}</div>
               <div className="text-[10px] text-gray-500">{plot.tag}</div>
            </div>
         </div>
       ))}
       <button onClick={onAdd} className="flex items-center justify-center gap-2 w-full py-2 border border-dashed border-[#262626] rounded-xl text-[12px] text-gray-600 hover:text-red-400 hover:border-red-500/30 transition-all">
          <Icon icon={ICONS.plus} size={24} /> Add Plots
       </button>
    </div>
  </div>
);

// --- MAIN LAYOUT ---
export default function SynopsisPhase({ logline, onNext, onBack }: SynopsisPhaseProps) {

  // 1. STATE MANAGEMENT
  const [loading, setLoading] = useState(false);
  
  // We manage the narrative text here so we can fill it via AI
  const [synopsisData, setSynopsisData] = useState({
    intro: "",
    plot: "",
    resolution: ""
  });
  
  // Mock Module Data
  const [characters, setCharacters] = useState<ModuleItem[]>([
    { id: '1', name: 'Jax', tag: 'Protagonist / Cyborg', color: 'from-blue-600 to-cyan-500' },
    { id: '2', name: 'Anya', tag: 'Sidekick / Human', color: 'from-pink-600 to-rose-500' },
    { id: '3', name: 'Krieg', tag: 'Antagonist / Warlord', color: 'from-red-600 to-orange-600' },
  ]);

  const [settings, setSettings] = useState<ModuleItem[]>([
    { id: '1', name: 'Neo-Chicago', tag: 'Dystopian City', color: 'from-slate-700 to-slate-900' },
    { id: '2', name: 'The Jazz Cellar', tag: 'Safehouse', color: 'from-amber-700 to-yellow-900' }
  ]);

  const [themes, setThemes] = useState<ModuleItem[]>([
    { id: '1', name: 'Humanity', tag: 'Soul vs Code', color: 'from-purple-600 to-indigo-600' },
    { id: '2', name: 'Legacy', tag: 'What remains', color: 'from-emerald-600 to-teal-600' }
  ]);

  const [plots, setPlots] = useState<ModuleItem[]>([
    { id: '1', name: 'The Discovery', tag: 'Inciting Incident', color: 'from-gray-700 to-gray-600' },
    { id: '2', name: 'The Chase', tag: 'Rising Action', color: 'from-gray-700 to-gray-600' },
  ]);


  // 2. AI GENERATION HANDLER
  const handleGenerateSynopsis = async () => {
    if (!logline) return alert("No logline found!");
    setLoading(true);

    try {
      const prompt = `
        Act as a professional screenwriter.
        Based on this logline: "${logline}"
        
        Write a 3-part synopsis.
        1. Introduction (Set the scene, protagonist, inciting incident) - Max 100 words.
        2. Plot Summary (Rising action, conflict, key twists) - Max 300 words.
        3. Resolution (Climax, aftermath, ending) - Max 100 words.

        Format: Return ONLY a valid JSON object:
        {
          "intro": "...",
          "plot": "...",
          "resolution": "...",
          "characters": [ { "name": "...", "role": "...", "age": "...", "desc": "..." } ],
          "settings": [ { "name": "...", "type": "...", "vibe": "..." } ],
          "themes": [ { "name": "...", "relevance": "..." } ]
        }
      `;

      const result = await aiService.generateStructured(prompt);
      
      // Update State
      setSynopsisData({
        intro: result.intro || "",
        plot: result.plot || "",
        resolution: result.resolution || ""
      });

    } catch (error) {
      console.error(error);
      alert("Failed to generate synopsis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers for Adding Items (Unique ID + Incremental Name) ---
  const handleAddCharacter = () => setCharacters([...characters, { 
    id: `char-${Date.now()}`, 
    name: `New Role ${characters.length + 1}`, 
    tag: 'Role', 
    color: 'from-gray-700 to-gray-600' 
    }]
);

  const handleAddSetting = () => setSettings([...settings, { 
    id: `set-${Date.now()}`, 
    name: `New Place ${settings.length + 1}`, 
    tag: 'Location', 
    color: 'from-gray-700 to-gray-600' 
  }]
);

  const handleAddTheme = () => setThemes([...themes, { 
    id: `theme-${Date.now()}`, 
    name: `New Theme ${themes.length + 1}`, 
    tag: 'Concept', 
    color: 'from-gray-700 to-gray-600' 
  }]
);

  const handleAddPlot = () => setPlots([...plots, { 
    id: `plot-${Date.now()}`, 
    name: `New Plot Point ${plots.length + 1}`, 
    tag: 'Event', 
    color: 'from-gray-700 to-gray-600' 
  }]
);

  return (
     <div className="max-w-6xl mx-auto pb-20 space-y-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Structure your Synopsis</h1>
                <p className="text-gray-400 text-sm">Expand your logline using generated Narrative Text and World Modules.</p>
            </div>
            <div className="flex gap-2">
               <Button variant="ghost" size="sm" onClick={onBack}>Edit Logline</Button>
               {/* NEW: GENERATE BUTTON */}
               <Button 
                 variant="secondary" 
                 size="sm" 
                 icon={ICONS.sparkles} 
                 onClick={handleGenerateSynopsis}
                 isLoading={loading}
                 className="bg-purple-900/20 text-purple-300 border-purple-500/30 hover:bg-purple-900/40"
               >
                 Auto-Fill Synopsis
               </Button>
            </div>
        </div>

        {/* LOGLINE ANCHOR */}
        <div className="bg-[#141414] border-l-4 border-purple-600 border border-r-[#262626] border-y-[#262626] rounded-r-xl p-5 shadow-lg flex gap-4 items-center">
             <div className="p-2 bg-purple-900/20 rounded-lg">
                <Icon icon={ICONS.lock} size={20} className="text-purple-400" />
             </div>
             <div>
                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Logline</span>
                <p className="text-lg text-gray-200 font-medium leading-relaxed pl-2">"{logline}"</p>
             </div>
        </div>

        {/* === THE WORKBENCH GRID === */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: NARRATIVE FLOW (The Story) - 8 Cols */}
            <div className="lg:col-span-7 flex flex-col gap-8">
                
                {/* 1. Intro */}
                <NarrativeSection
                    title="1. Introduction"
                    icon={ICONS.play}
                    limit="50-100"
                    minHeight='min-h-[150px]'
                    value={synopsisData.intro}
                    onChange={(val) => setSynopsisData({...synopsisData, intro: val})}
                />

                {/* 2. Plot (Big) */}
                <NarrativeSection
                     title="2. Plot Summary"
                     icon={ICONS.list}
                     limit="200-500"
                     minHeight='min-h-[400px]'
                     value={synopsisData.plot}
                     onChange={(val) => setSynopsisData({...synopsisData, plot: val})}
                />

                {/* 3. Resolution */}
                <NarrativeSection
                     title="3. Resolution"
                     icon={ICONS.checkCircle}
                     limit="50-100"
                     minHeight='min-h-[150px]'
                     value={synopsisData.resolution}
                     onChange={(val) => setSynopsisData({...synopsisData, resolution: val})}
                />
            </div>

            {/* RIGHT COLUMN: WORLD MODULES (The Assets) - 4 Cols */}
            <div className="lg:col-span-5 flex flex-col gap-8">
                 
                 {/* Visual Hint */}
                 <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-xl flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-full text-blue-400"><Icon icon={ICONS.sparkles} size={14}/></div>
                    <p className="text-xs text-blue-200">
                       <strong>Script Modules Active:</strong> Changes here update your project database.
                    </p>
                 </div>

                 <CharacterGrid items={characters} onAdd={handleAddCharacter} />
                 
                 <SettingGrid items={settings} onAdd={handleAddSetting} />

            </div>
        </div>

        {/* === BOTTOM ROW: THEMES + PLOTS === */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-0 border-[#262626] pt-8">
            <ThemeGrid items={themes} onAdd={handleAddTheme} />
            <PlotGrid items={plots} onAdd={handleAddPlot} />
        </div>

        <div className="mb-8 mt-18 flex items-start gap-3 p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
          <Icon icon={ICONS.info} className="text-gray-400 mt-0.5 shrink-0" size={16} />
          <p className="text-sm text-gray-400">
            To modify this synopsis, use the <strong>Script Copilot</strong> and <strong>Script Modules</strong> on the right.
          </p>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" size="md">Save as Draft</Button>
          <Button variant="primary" size="lg" onClick={onNext} icon={ICONS.layers}>
            Complete Synopsis & Next
          </Button>
        </div>
     </div>
  );
}