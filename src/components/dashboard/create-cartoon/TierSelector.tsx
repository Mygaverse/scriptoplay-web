'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import { ICONS } from '@/config/icons';
import { CartoonProjectConfig } from './CartoonDiscoveryWizard';

type TierSelectorProps = {
  selected: CartoonProjectConfig['tier'];
  onSelect: (tier: CartoonProjectConfig['tier']) => void;
};

const TIER_OPTIONS = [
  {
    id: 'Hobbyist',
    label: 'Hobbyist',
    desc: 'Single-Take Fast Magic. AI automatically interpolates your story from start to finish. Limited to micro-shorts.',
    icon: ICONS.magic,
    activeClasses: 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)]',
    iconClasses: 'bg-purple-900/20 text-purple-400'
  },
  {
    id: 'Creator',
    label: 'Creator',
    desc: 'Deep Control & Stitching. Manage individual scenes and assemble them automatically. Great for standard stories.',
    icon: ICONS.camcorder,
    activeClasses: 'border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.2)]',
    iconClasses: 'bg-pink-900/20 text-pink-400'
  },
  {
    id: 'Director',
    label: 'Director',
    desc: 'Full cinematic control for long-form content. Complete oversight of pacing, audio, and visual sequencing.',
    icon: ICONS.directorChair,
    secondaryIcon: ICONS.starFilled,
    activeClasses: 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]',
    iconClasses: 'bg-emerald-900/20 text-emerald-400'
  }
] as const;

export default function TierSelector({ selected, onSelect }: TierSelectorProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-white">Select Editing Tier</h2>
        <p className="text-gray-400">Choose the level of control and available formats for this project.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIER_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id as CartoonProjectConfig['tier'])}
            className={`
              relative group flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all duration-300 text-center overflow-hidden hover:scale-[1.02]
              ${selected === option.id
                ? ('bg-[#1a1a1a] ' + option.activeClasses)
                : 'border-[#262626] bg-[#141414] hover:border-gray-600'
              }
            `}
          >
            <div className={`relative w-16 h-16 rounded-full mb-4 flex items-center justify-center group-hover:scale-110 transition-transform ${option.iconClasses}`}>
              <Icon icon={option.icon} size={32} />
              {/* Stacked Secondary Icon (like the yellow star on the director chair) */}
              {'secondaryIcon' in option && (
                <div className="absolute top-1 right-0 text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  <Icon icon={option.secondaryIcon} size={18} />
                </div>
              )}
            </div>
            <h3 className={`text-xl font-bold mb-2 ${selected === option.id ? 'text-white' : 'text-gray-300'}`}>
              {option.label}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {option.desc}
            </p>
          </button>
        ))}
      </div>
    </div >
  );
}
