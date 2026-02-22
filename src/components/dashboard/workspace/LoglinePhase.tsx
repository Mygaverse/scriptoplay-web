'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ICONS } from '@/config/icons';
// Adjust this import path if your MagicLogline is elsewhere
import MagicLogline from '@/components/dashboard/workspace/MagicLogline';
import { aiService } from '@/services/aiService';
// import { VersionDocument } from '@/types/firestore';

interface VersionDocument {
  id: string;
  phase: string;
  snapshotData: any;
  timestamp?: { toDate: () => Date };
}

interface LoglinePhaseProps {
  //initialLogline: string;
  value: string;
  onChange: (val: string) => void;
  isGenerated: boolean;
  isMagicMode: boolean;
  onNext: () => void;
  // PROPS FOR VERSIONING
  onSaveDraft?: (phase: string) => void;
  onSaveVersion?: () => void;
  versions: VersionDocument[];
  onGenerateBeatSheet: () => void;
  isGenerating: boolean;

  // Style & Audience
  selectedStyle: string;
  onSelectStyle: (id: string) => void;
  selectedAudience: string;
  onSelectAudience: (id: string) => void;
  // New Constraints
  genre?: string;
  vibe?: string;
  theme?: string;
  isHobbyist?: boolean;
}

export default function LoglinePhase({
  value,
  onChange,
  isGenerated,
  isMagicMode,
  onNext,
  onSaveDraft,
  onSaveVersion,
  versions,
  onGenerateBeatSheet,
  isGenerating,
  selectedStyle,
  onSelectStyle,
  selectedAudience,
  onSelectAudience,
  genre,
  vibe,
  theme,
  isHobbyist
}: LoglinePhaseProps) {

  const [loading, setLoading] = useState(false);

  // --- AI HANDLER ---
  const handleMagicRewrite = async () => {
    if (!value) return;
    setLoading(true);

    try {
      const prompt = `
        Rewrite the following logline to be more punchy, professional, and high-stakes.
        
        Constraints:
        - Target Audience: ${selectedAudience}${genre ? `\n- Genre: ${genre}` : ''}${vibe ? `\n- Tone/Vibe: ${vibe}` : ''}${theme ? `\n- Theme: ${theme}` : ''}
        
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

  // Using new RegExp to avoid TSX parsing errors with forward slashes
  const wordCount = value.trim().split(new RegExp('\\s+')).filter(w => w.length > 0).length;
  const isOverLimit = wordCount > maxWords;

  return (
    <div className="w-full pb-20">

      {/* Header */}
      <div className="text-left mb-8 mt-4">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <div className="p-2 bg-pink-500/20 rounded-xl text-pink-400">
            <Icon icon={ICONS.sparkles} size={24} />
          </div>
          {isGenerated ? "Generated Logline" : "Write your Logline"}
        </h1>
        <p className="text-gray-400">
          {isGenerated ? "This concept was blended by AI. Use the tools to refine it." : "Start your story from a single sentence."}
        </p>
      </div>

      {/* Toolbar - Only show when there is content */}
      {!!value && (
        <div className="flex items-center justify-end mb-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm" icon={ICONS.refresh}
              className='cursor-pointer'
            >
              Regenerate New
            </Button>

            {/* Magic Rewrite Button */}
            <Button
              variant="secondary"
              size="sm"
              icon={ICONS.sparkles}
              onClick={handleMagicRewrite}
              isLoading={loading}
              className="bg-purple-900/20 text-purple-300 border-purple-500/30 hover:bg-purple-900/40 cursor-pointer"
            >
              Magic Polish
            </Button>
          </div>
        </div>
      )}

      {/* Editor Box */}
      <div className="relative group mb-6">
        {isGenerated && <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl opacity-30 blur pointer-events-none"></div>}

        <div className={`relative border rounded-xl overflow-hidden transition-colors ${isGenerated ? 'bg-[#0f0f0f] border-purple-500/30' : 'bg-[#141414] border-[#262626]'
          }`}>
          {isGenerated ? (
            <div className="min-h-[200px]">
              <MagicLogline text={value} isMagicMode={isMagicMode} />
            </div>
          ) : (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-[#0a0a0a] rounded-lg p-6 text-xl text-gray-200 placeholder-gray-600 outline-none resize-none min-h-[200px] leading-relaxed block disabled:opacity-50"
              placeholder="e.g. When a killer shark unleashes chaos on a beach community..."
              disabled={loading || isHobbyist} // Disable while AI thinks or if Hobbyist
            />
          )}

          <div className="absolute bottom-4 right-4 flex items-center gap-3 pointer-events-none">
            {isGenerated && (
              <Badge variant="neutral" className="flex items-center gap-1 bg-purple-900/20 text-purple-300 border-purple-500/20">
                <Icon icon={ICONS.lock} size={10} /> Locked
              </Badge>
            )}
            <div className={`text-xs font-medium bg-gray-800 p-2 rounded-md ${isOverLimit ? 'text-red-400' : 'text-gray-500'}`}>
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
        <Button
          variant="ghost"
          size="md"
          className='cursor-pointer'
          icon={ICONS.save}
          onClick={() => {
            if (onSaveVersion) onSaveVersion();
            else if (onSaveDraft) onSaveDraft('logline');
          }}
        >
          Save Version Snapshot
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onGenerateBeatSheet} // Calls parent function
          icon={isGenerating ? ICONS.spinner : ICONS.sparkles}
          disabled={wordCount === 0 || isOverLimit || isGenerating}
          isLoading={isGenerating}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-none cursor-pointer"
        >
          {isGenerating ? "Analyzing..." : "Generate Beat Sheet"}
        </Button>
      </div>

      {/* VERSION HISTORY LIST */}
      {
        versions.length > 0 && (
          <div className="border-0 border-[#262626] pt-8 animate-in slide-in-from-bottom-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Icon icon={ICONS.clock} size={14} /> Version History
            </h3>

            <div className="space-y-3">
              {versions.filter(v => v.phase === 'logline').map((v) => (
                <div
                  key={v.id}
                  className="group bg-[#141414] border border-[#262626] rounded-xl p-4 flex items-center justify-between hover:border-gray-600 transition-all"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="neutral" className="text-[10px] py-0 h-5">
                        {v.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {v.timestamp?.toDate().toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 truncate font-medium">"{v.snapshotData.logline}"</p>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => onChange(v.snapshotData.logline)} // RESTORE ACTION
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )
      }

    </div >
  );
}