'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ICONS } from '@/config/icons';
// Adjust this import path if your MagicLogline is elsewhere
import MagicLogline from '@/components/dashboard/workspace/MagicLogline';

import { aiService } from '@/services/aiService'; // Import AI

interface LoglinePhaseProps {
  //initialLogline: string;
  value: string;
  onChange: (val: string) => void;
  isGenerated: boolean;
  isMagicMode: boolean;
  onNext: () => void;
}

export default function LoglinePhase({ 
  //initialLogline, 
  value, 
  onChange,
  isGenerated, 
  isMagicMode, 
  onNext 
}: LoglinePhaseProps) {

  const [loading, setLoading] = useState(false);

  // --- AI HANDLER ---
  const handleMagicRewrite = async () => {
    if (!value) return;
    setLoading(true);

    try {
      const prompt = `
        Rewrite the following logline to be more punchy, professional, and high-stakes.
        Keep it under 50 words.
        Current Logline: "${value}"
        Return ONLY the rewritten logline text.
      `;
      
      const result = await aiService.generate(prompt);
      onChange(result); // Update parent state immediately
      
    } catch (error) {
      alert("AI Rewrite failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  //const [text, setText] = useState(initialLogline);
  const maxWords = 50;

  /*
  useEffect(() => {
    setText(initialLogline);
  }, [initialLogline]);
  */

  // FIX: Using new RegExp to avoid TSX parsing errors with forward slashes
  const wordCount = value.trim().split(new RegExp('\\s+')).filter(w => w.length > 0).length;
  const isOverLimit = wordCount > maxWords;

  return (
    <div className="max-w-3xl mx-auto pb-20">
      
      {/* Header */}
      <div className="text-left mb-8 mt-4">
        <h1 className="text-3xl font-bold text-white mb-2">
          {isGenerated ? "Generated Logline" : "Write your Logline"}
        </h1>
        <p className="text-gray-400">
          {isGenerated ? "This concept was blended by AI. Use the tools to refine it." : "Start your story from a single sentence."}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-end mb-4">
        <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={ICONS.refresh}>Regenerate New</Button>
            {/* Magic Rewrite Button */}
            <Button 
              variant="secondary" 
              size="sm" 
              icon={ICONS.sparkles}
              onClick={handleMagicRewrite}
              isLoading={loading}
            >
              Magic Polish
            </Button>
        </div>
      </div>

      {/* Editor Box */}
      <div className="relative group mb-6">
        {isGenerated && <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl opacity-30 blur pointer-events-none"></div>}
        
        <div className={`relative border rounded-xl p-1 transition-colors ${
          isGenerated ? 'bg-[#0f0f0f] border-purple-500/30' : 'bg-[#141414] border-[#262626]'
        }`}>
          {isGenerated ? (
             <div className="min-h-[200px]">
                <MagicLogline text={value} isMagicMode={isMagicMode} />
             </div>
          ) : (
             <textarea 
               value={value}
               onChange={(e) => onChange(e.target.value)}
               className="w-full bg-[#0a0a0a] rounded-lg p-6 text-xl text-gray-200 placeholder-gray-600 outline-none resize-none min-h-[200px] leading-relaxed block"
               placeholder="e.g. When a killer shark unleashes chaos on a beach community..."
               disabled={loading} // Disable while AI thinks
             />
          )}
          
          <div className="absolute bottom-4 right-4 flex items-center gap-3 pointer-events-none">
              {isGenerated && (
                <Badge variant="neutral" className="flex items-center gap-1 bg-purple-900/20 text-purple-300 border-purple-500/20">
                   <Icon icon={ICONS.lock} size={10} /> Locked
                </Badge>
              )}
              <div className={`text-xs font-medium ${isOverLimit ? 'text-red-400' : 'text-gray-500'}`}>
                  {wordCount} / {maxWords} Words
              </div>
          </div>
        </div>
      </div>
      
      {isGenerated && (
        <div className="mb-8 flex items-start gap-3 p-4 bg-[#1a1a1a] rounded-lg border border-[#262626]">
          <Icon icon={ICONS.info} className="text-gray-400 mt-0.5 shrink-0" size={16} />
          <p className="text-sm text-gray-400">
            To modify this logline, use the <strong>Script Copilot</strong> on the right.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" size="md">Save as Draft</Button>
        <Button 
          variant="primary" 
          size="lg" 
          onClick={onNext}
          icon={ICONS.sparkles}
          disabled={wordCount === 0 || isOverLimit}
        >
          Generate Synopsis
        </Button>
      </div>
    </div>
  );
}