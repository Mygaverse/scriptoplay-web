'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ICONS } from '@/config/icons';
import MagicLogline from '@/components/dashboard/workspace/MagicLogline'; 

// --- Types ---
interface EntityItem {
  id: string;
  name: string;
  desc: string;
}

interface SynopsisPhaseProps {
  logline: string;
  onNext: () => void;
  onBack: () => void;
}

// --- SUB-COMPONENT 1: NARRATIVE BLOCK (Text Areas) ---
const NarrativeBlock = ({ 
  title, 
  limit, 
  value, 
  minHeight = "min-h-[150px]", 
  icon 
}: { 
  title: string; 
  limit: string; 
  value: string; 
  minHeight?: string;
  icon: string;
}) => {
  const [isMagicMode, setMagicMode] = useState(false);
  const [text, setText] = useState(value);

  return (
    <div className={`bg-[#141414] border rounded-xl overflow-hidden flex flex-col h-full transition-all duration-300 ${
        isMagicMode ? 'border-purple-500 ring-1 ring-purple-500/30' : 'border-[#262626]'
    }`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#262626] flex justify-between items-center bg-[#1a1a1a]/50">
          <div className="flex items-center gap-2">
             <Icon icon={icon} size={14} className="text-purple-400" />
             <h3 className="text-sm font-bold text-gray-200">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mr-2">{limit} Words</span>
              
              {/* Magic Toggle */}
              <button 
                onClick={() => setMagicMode(!isMagicMode)}
                className={`p-1 rounded transition-colors ${isMagicMode ? 'text-purple-400 bg-purple-900/20' : 'text-gray-500 hover:text-white'}`}
                title="Magic Pointer Mode"
              >
                <Icon icon={ICONS.wand} size={14} />
              </button>

              {/* Variant Button */}
              <button className="flex items-center gap-1 text-[10px] bg-[#262626] hover:bg-purple-600 text-gray-400 hover:text-white px-2 py-1 rounded border border-[#333] transition-all">
                 <Icon icon={ICONS.shuffle} size={10} /> Variants
              </button>
          </div>
      </div>
      
      {/* Content Area - Switches between Textarea and Magic View */}
      <div className={`flex-1 w-full bg-[#0a0a0a] relative ${minHeight}`}>
         {isMagicMode ? (
            <div className="p-4">
                <MagicLogline text={text} isMagicMode={true} />
            </div>
         ) : (
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-full bg-transparent p-4 text-sm text-gray-300 placeholder-gray-700 outline-none resize-none leading-relaxed focus:bg-[#0f0f0f] transition-colors"
            />
         )}
      </div>
    </div>
  );
};

// --- SUB-COMPONENT 2: ENTITY LIST BLOCK (Characters, Settings, Themes) ---
const EntityListBlock = ({ 
  title, 
  items, 
  onAdd, 
  icon 
}: { 
  title: string; 
  items: EntityItem[]; 
  onAdd: () => void; 
  icon: string;
}) => {
  return (
    <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#262626] flex justify-between items-center bg-[#1a1a1a]/50">
          <div className="flex items-center gap-2">
             <Icon icon={icon} size={14} className="text-blue-400" />
             <h3 className="text-sm font-bold text-gray-200">{title}</h3>
          </div>
          <button 
            onClick={onAdd}
            className="flex items-center gap-1 text-[10px] bg-blue-900/20 hover:bg-blue-600 text-blue-300 hover:text-white px-2 py-1 rounded border border-blue-500/30 transition-all"
          >
             <Icon icon={ICONS.plus} size={10} /> Add New
          </button>
      </div>
      
      {/* List Area */}
      <div className="flex-1 bg-[#0a0a0a] p-2 space-y-2 overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-zinc-800">
         {items.map((item) => (
           <div key={item.id} className="group p-3 rounded-lg border border-[#262626] bg-[#141414] hover:border-blue-500/50 hover:bg-[#1a1a1a] transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-1">
                 <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{item.name}</span>
                 <button className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white">
                    <Icon icon={ICONS.moreVertical} size={12} />
                 </button>
              </div>
              <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{item.desc}</p>
           </div>
         ))}
         
         {items.length === 0 && (
           <div className="h-full flex flex-col items-center justify-center text-gray-600 p-4 min-h-[100px]">
              <span className="text-xs">No {title.toLowerCase()} added yet.</span>
              <span className="text-[10px] mt-1">Highlight text in narrative to add.</span>
           </div>
         )}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function SynopsisPhase({ logline, onNext, onBack }: SynopsisPhaseProps) {
  
  // Mock State for Entities
  const [characters, setCharacters] = useState<EntityItem[]>([
    { id: '1', name: 'Jax (Cyborg)', desc: 'Retired combat unit. Melancholic, obsessed with jazz, struggling with PTSD from the Corporate Wars.' },
    { id: '2', name: 'Anya', desc: 'A young scavenger who discovers Jax. She represents hope and the new generation of Mars.' }
  ]);

  const [settings, setSettings] = useState<EntityItem[]>([
    { id: '1', name: 'Neo-Chicago (Mars)', desc: 'A domed city suffering from oxygen rationing. Neon lights mixed with red dust.' },
    { id: '2', name: 'The Jazz Cellar', desc: 'An underground bunker where Jax hides his saxophone collection.' }
  ]);

  const [themes, setThemes] = useState<EntityItem[]>([
    { id: '1', name: 'Man vs Machine', desc: 'Can artificial life have a soul?' },
    { id: '2', name: 'Legacy', desc: 'What we leave behind defines us.' }
  ]);

  // Mock Text Data
  const plotSummaryText = "In the year 2145, Mars Colony 7 is controlled by the OmniCorp. JAX, a retired combat cyborg designated 'Unit 734', lives in the shadows of the lower levels... \n\nOne day, while scavenging for parts, he hears a sound he has never heard before: a saxophone. He traces it to a collapsed bunker where he meets ANYA...";

  return (
     <div className="max-w-6xl mx-auto pb-20 space-y-8">
        
        {/* 1. HEADER */}
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Structure your Synopsis</h1>
                <p className="text-gray-400 text-sm">Expand your logline into a detailed narrative framework.</p>
            </div>
            <div className="flex gap-2">
               <Button variant="secondary" size="sm" icon={ICONS.refresh}>Regenerate All</Button>
               <Button variant="ghost" size="sm" onClick={onBack}>Edit Logline</Button>
            </div>
        </div>

        {/* 2. LOGLINE ANCHOR (Locked) */}
        <div className="bg-[#141414] border-l-4 border-purple-600 border-y border-r border-r-[#262626] border-y-[#262626] rounded-r-xl p-5 shadow-lg">
             <div className="flex justify-between items-start mb-2">
                 <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Source Material</span>
                 <Icon icon={ICONS.lock} size={12} className="text-gray-600" />
             </div>
             <p className="text-base text-gray-200 font-medium italic">"{logline}"</p>
        </div>

        {/* 3. SYNOPSIS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* ROW 1: Intro (Text) + Themes (List) */}
            <div className="md:col-span-8">
                <NarrativeBlock
                    title="1. Introduction"
                    icon={ICONS.play}
                    limit="50-100"
                    value="Mars Colony 7. A rust-colored wasteland controlled by OmniCorp. Jax, a retired combat droid, spends his days scraping rust off solar panels..."
                />
            </div>
            <div className="md:col-span-4">
                 <EntityListBlock
                     title="Themes"
                     icon={ICONS.fileText}
                     items={themes}
                     onAdd={() => setThemes([...themes, { id: 'new', name: 'New Theme', desc: 'Description...' }])}
                 />
            </div>

            {/* ROW 2: Plot (Text - Big) + Settings (List) */}
            <div className="md:col-span-8">
                <NarrativeBlock
                     title="2. Plot Summary"
                     icon={ICONS.list}
                     limit="200-500"
                     minHeight="min-h-[350px]"
                     value={plotSummaryText}
                />
            </div>
            <div className="md:col-span-4 flex flex-col gap-6">
                 <EntityListBlock
                     title="Settings"
                     icon={ICONS.map}
                     items={settings}
                     onAdd={() => setSettings([...settings, { id: 'new', name: 'New Location', desc: 'Description...' }])}
                 />
                 {/* Tip Card */}
                 <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-blue-400">
                       <Icon icon={ICONS.sparkles} size={14} />
                       <span className="text-xs font-bold">Pro Tip</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                       Enable <strong>Magic Pointer</strong> in the Plot Summary to quickly detect and add new Characters or Settings to your lists.
                    </p>
                 </div>
            </div>

            {/* ROW 3: Resolution (Text) + Characters (List - Big) */}
            <div className="md:col-span-4">
                 <NarrativeBlock
                     title="3. Resolution"
                     icon={ICONS.checkCircle}
                     limit="50-100"
                     value="Jax sacrifices his chassis to power the grid, ensuring the music plays on. Anya rebuilds him as a jukebox."
                />
            </div>
            <div className="md:col-span-8">
                <EntityListBlock
                     title="Characters"
                     icon={ICONS.user}
                     items={characters}
                     onAdd={() => setCharacters([...characters, { id: 'new', name: 'New Character', desc: 'Role...' }])}
                />
            </div>
        </div>

        {/* 4. FOOTER */}
        <div className="flex justify-end pt-8 border-t border-[#262626]">
            <Button variant="primary" size="lg" onClick={onNext} icon={ICONS.layers}>
              Complete Synopsis & Next
            </Button>
        </div>
     </div>
  );
}