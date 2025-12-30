'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';
import Tooltip from '@/components/ui/Tooltip';
import { ICONS } from '@/config/icons';
import { motion, AnimatePresence } from 'framer-motion';

type ToolId = 'copilot' | 'agent' | 'modules' | 'insights';

const AI_TOOLS = [
  { id: 'copilot', label: 'Script Copilot', icon: ICONS.copilot, color: 'text-purple-400' },
  { id: 'agent', label: 'Script Agent', icon: ICONS.user, color: 'text-blue-400' },
  { id: 'modules', label: 'Script Modules', icon: ICONS.grid, color: 'text-orange-400' },
  { id: 'insights', label: 'Script Insights', icon: ICONS.barChart, color: 'text-green-400' },
];

export default function RightPanel({ isMagicMode, setMagicMode }: { isMagicMode: boolean, setMagicMode: (b: boolean) => void }) {
  const [activeTool, setActiveTool] = useState<ToolId>('copilot');

  const suggestions = [
    { label: "+ Romance Subplot" }, 
    { label: "+ Suspense" },
    { label: "Cyborg → Human" },
    { label: "+ Comedy Subplot" }, 
    { label: "+ Drama" },
    { label: "Cyborg → Monster" },
  ];

  return (
    <div className="w-96 border-l border-[#262626] bg-[#0f0f0f] flex flex-col h-full shrink-0 relative z-20">
      
      {/* 1. TOP TABS (Fixed Height, No Scroll) */}
      <div className="h-20 border-b border-[#262626] flex items-center justify-between px-4 bg-[#0f0f0f] shrink-0">
         <div className="flex gap-1">
            {AI_TOOLS.map((tool) => {
              const isActive = activeTool === tool.id;
              return (
                <div key={tool.id} className="relative z-50"> 
                   {/* Tooltip Wrapper needs high Z-index */}
                   {isActive ? (
                    <button 
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border border-[#262626] rounded-lg transition-all"
                      onClick={() => setActiveTool(tool.id as ToolId)}
                    >
                      <Icon icon={tool.icon} size={16} className={tool.color} />
                      <span className="text-xs font-bold text-white whitespace-nowrap">{tool.label}</span>
                    </button>
                  ) : (
                    <Tooltip content={tool.label}>
                      <button 
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-[#1a1a1a] transition-colors"
                        onClick={() => setActiveTool(tool.id as ToolId)}
                      >
                        <Icon icon={tool.icon} size={18} />
                      </button>
                    </Tooltip>
                  )}
                </div>
              );
            })}
         </div>
         {/* Collapse Button (Placeholder) */}
         <button className="text-gray-500 hover:text-white"><Icon icon={ICONS.moreVertical} size={16} /></button>
      </div>

      {/* 2. MAIN CONTENT (Scrolls Independently) */}
      <div className="flex-1 flex flex-col overflow-hidden relative min-h-0">
         <AnimatePresence mode="wait">
            {activeTool === 'copilot' && (
               <motion.div 
                 key="copilot"
                 initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                 className="flex flex-col h-full"
               >
                  {/* Chat History */}
                  <div className="flex-1 p-6 space-y-6 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-zinc-800">
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0 mt-1">
                          <Icon icon={ICONS.copilot} size={14} className="text-white" />
                        </div>
                        <div className="bg-[#1a1a1a] p-4 rounded-r-2xl rounded-bl-2xl text-sm text-gray-300 border border-[#262626] shadow-sm">
                           I've analyzed your generated logline. Use the  <strong>Magic Pointer</strong> to refine specific elements.
                        </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="bg-[#1a1a1a] p-4 rounded-r-2xl rounded-bl-2xl text-sm text-gray-300 border border-[#262626] shadow-sm">
                          I'm ready. Once you finish your Logline, I can help you expand it into a full Synopsis automatically.
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center shrink-0 mt-1">
                          <Icon icon={ICONS.user} size={16} className="text-white" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0 mt-1">
                          <Icon icon={ICONS.copilot} size={14} className="text-white" />
                        </div>
                        <div className="bg-[#1a1a1a] p-4 rounded-r-2xl rounded-bl-2xl text-sm text-gray-300 border border-[#262626] shadow-sm">
                           I've analyzed your generated logline. Use the <strong>Magic Pointer</strong> to refine specific elements.
                        </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="bg-[#1a1a1a] p-4 rounded-r-2xl rounded-bl-2xl text-sm text-gray-300 border border-[#262626] shadow-sm">
                          I'm ready. Once you finish your Logline, I can help you expand it into a full Synopsis automatically.
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center shrink-0 mt-1">
                          <Icon icon={ICONS.user} size={16} className="text-white" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0 mt-1">
                          <Icon icon={ICONS.copilot} size={14} className="text-white" />
                        </div>
                        <div className="bg-[#1a1a1a] p-4 rounded-r-2xl rounded-bl-2xl text-sm text-gray-300 border border-[#262626] shadow-sm">
                           I've analyzed your generated logline. Use the <strong>Magic Pointer</strong> to refine specific elements.
                        </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="bg-[#1a1a1a] p-4 rounded-r-2xl rounded-bl-2xl text-sm text-gray-300 border border-[#262626] shadow-sm">
                          I'm ready. Once you finish your Logline, I can help you expand it into a full Synopsis automatically.
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center shrink-0 mt-1">
                          <Icon icon={ICONS.user} size={16} className="text-white" />
                      </div>
                    </div>
                    {/* Add dummy content to test scroll */}
                    <div className="h-[200px]"></div> 
                  </div>

                  {/* 3. INPUT AREA (Fixed Bottom) */}
                  <div className="shrink-0 relative bg-[#0f0f0f]">
                    
                    {/* Suggestion Chips (Floating above border) */}
                    <div className="relative -top-4 left-4 flex-wrap z-10">
                       {suggestions.map(s => (
                         <button key={s.label} className="text-[11px] font-medium bg-[#141414] border border-[#262626] hover:border-purple-500 text-gray-400 hover:text-purple-300 px-3 py-1.5 mt-2 rounded-full shadow-lg transition-colors backdrop-blur-sm">
                           {s.label}
                         </button>
                       ))}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-[#262626] w-full" />

                    {/* Input Box */}
                    <div className="p-4">
                       <div className={`relative bg-[#141414] border rounded-xl transition-all ${
                         isMagicMode ? 'border-purple-500 ring-1 ring-purple-500/30' : 'border-[#262626]'
                       }`}>
                          <textarea 
                            rows={3}
                            placeholder={isMagicMode ? "Select text to edit..." : "Ask Script-Copilot..."}
                            className="w-full bg-transparent pl-4 pr-12 py-3 text-sm focus:outline-none resize-none scrollbar-hide text-white"
                          />
                          {/* Action Bar (Upload & Magic Toggle) */}
                          <div className="absolute bottom-2 left-2 flex items-center gap-2">
                              <Tooltip content="Upload Reference">
                                <button className="p-1.5 rounded-lg hover:bg-[#262626] text-gray-400 hover:text-white transition-colors">
                                  <Icon icon={ICONS.paperclip} size={16} />
                                </button>
                              </Tooltip>
    
                              <Tooltip content="Magic Pointer">
                                <button 
                                  onClick={() => setMagicMode(!isMagicMode)}
                                  className={`p-1.5 rounded-lg transition-all flex items-center gap-2 ${
                                    isMagicMode 
                                      ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]' 
                                      : 'hover:bg-[#262626] text-gray-400 hover:text-purple-400'
                                  }`}
                                >
                                  <Icon icon={ICONS.wand} size={16} />
                                  {isMagicMode && <span className="text-[10px] font-bold pr-1">ON</span>}
                                </button>
                              </Tooltip>
                          </div>

                          {/* Send Button */}
                          <button className="absolute right-2 bottom-2 p-1.5 bg-[#262626] rounded-lg hover:bg-purple-600 text-gray-400 hover:text-white transition-colors">
                              <Icon icon={ICONS.send} size={16} />
                          </button>
                       </div>
                    </div>
                  </div>
               </motion.div>
            )}

            {/* Placeholder for other tools */}
            {activeTool !== 'copilot' && (
                <div className="flex-1 flex flex-col items-center justify-start text-gray-500 p-8 text-center">
                  <Icon icon={AI_TOOLS.find(t=>t.id===activeTool)?.icon || ICONS.bot} size={48} className="mb-4 opacity-20" />
                  <p className="text-sm">Active Tool: <span className="text-white font-bold">{AI_TOOLS.find(t=>t.id===activeTool)?.label}</span></p>
                </div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}