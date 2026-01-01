import React from 'react';
import Icon from '@/components/ui/Icon';
import { ICONS } from '@/config/icons';

// --- TYPES ---
export interface Character {
  name: string;
  role: string; // Protagonist, Antagonist, Mentor
  age: string;
  desc: string;
}

export interface Setting {
  name: string;
  type: string; // Interior, Exterior, Space Station
  vibe: string; // Claustrophobic, Neon, Dusty
}

export interface Theme {
  name: string;
  color: string;
}

// --- CHARACTER CARD ---
export const CharacterCard = ({ char }: { char: Character }) => (
  <div className="bg-[#141414] border border-[#262626] p-3 rounded-lg flex items-start gap-3 hover:border-purple-500/30 transition-colors group">
     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center text-white font-bold text-xs shrink-0 border border-white/10">
        {char.name.charAt(0)}
     </div>
     <div className="min-w-0">
        <h4 className="text-sm font-bold text-gray-200 group-hover:text-purple-400 transition-colors truncate">{char.name}</h4>
        <div className="flex flex-wrap gap-1 my-1">
           <span className="text-[10px] px-1.5 py-0.5 bg-[#262626] rounded text-gray-400">{char.role}</span>
           <span className="text-[10px] px-1.5 py-0.5 bg-[#262626] rounded text-gray-400">{char.age}</span>
        </div>
        <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{char.desc}</p>
     </div>
  </div>
);

// --- SETTING CARD ---
export const SettingCard = ({ setting }: { setting: Setting }) => (
  <div className="bg-[#141414] border border-[#262626] p-3 rounded-lg hover:border-blue-500/30 transition-colors group">
     <div className="flex justify-between items-start mb-1">
        <h4 className="text-sm font-bold text-gray-200 group-hover:text-blue-400 transition-colors">{setting.name}</h4>
        <Icon icon={ICONS.pin} size={12} className="text-gray-600" />
     </div>
     <div className="flex gap-2 text-[10px] text-gray-500 mb-2">
        <span className="uppercase tracking-wider">{setting.type}</span>
        <span>•</span>
        <span className="text-blue-400/80">{setting.vibe}</span>
     </div>
  </div>
);

// --- THEME TAG ---
export const ThemeTag = ({ theme }: { theme: Theme }) => (
  <div className="px-3 py-1.5 rounded-full bg-[#1a1a1a] border border-[#262626] text-xs text-gray-300 flex items-center gap-2">
     <span className={`w-2 h-2 rounded-full ${theme.color}`}></span>
     {theme.name}
  </div>
);