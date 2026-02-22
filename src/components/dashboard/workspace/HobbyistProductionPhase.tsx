'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { ICONS } from '@/config/icons';
import { videoService } from '@/services/videoService';
import { imageService } from '@/services/imageService';
import { useAuth } from '@/context/AuthContext';
import { assetService } from '@/services/assetService';
import { VISUAL_STYLES, getStyleConfig } from '@/config/styles';
import { audioService } from '@/services/audioService';
import { storageService } from '@/services/storageService';
import { videoAssemblyService } from '@/services/videoAssemblyService';

type HobbyistProductionPhaseProps = {
  projectData: any;
  onBack: () => void;
  onSave?: (data: any) => void;
  onNext: () => void;
};

export default function HobbyistProductionPhase({ projectData, onBack, onSave, onNext }: HobbyistProductionPhaseProps) {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(projectData?.modules?.hobbyistVideo || null);

  const scenes = projectData?.modules?.script || [];
  const styleConfig = getStyleConfig(projectData.modules?.style || projectData.style);

  const fullMotionPrompt = scenes.map((s: any) => s.visual_prompt_motion || s.action).join('. ');
  const masterPrompt = `${fullMotionPrompt}. Style: ${styleConfig.prompt}. cinematic, fluid motion, masterpiece. --no morphing, text, watermarks`;

  const startImgUrl = scenes.length > 0 ? scenes[0].production_image : null;
  const endImgUrl = scenes.length > 1 ? scenes[scenes.length - 1].production_image : undefined;

  const isReadyToGenerate = scenes.length > 0 && startImgUrl;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      if (!isReadyToGenerate) throw new Error("Missing start keyframe. Please render shots in the Script phase.");

      // --- PHASE 1: GENERATE SPEECH ---
      let finalAudioUrl: string | undefined = undefined;
      let dialogueText = "";
      let primaryVoiceId = "alloy"; // Default fallback
      let mainChar: string | null = null;
      const casting = projectData?.modules?.audio?.casting || {};

      // Extract dialogue
      scenes.forEach((scene: any) => {
        if (scene.dialogue && scene.dialogue.length > 0) {
          scene.dialogue.forEach((d: any) => {
            dialogueText += d.line + " ";
            if (!mainChar) mainChar = d.character; // Keep Name for reference
          });
        }
      });

      if (dialogueText.trim()) {
        setStatusText('Recording character voices...');

        // Resolve the Voice ID correctly by looking up the Character ID visually
        if (mainChar) {
          const assets = projectData?.modules?.assets || [];
          const charAsset = assets.find((a: any) => a.type === 'Character' && a.name === mainChar);
          const charId = charAsset ? charAsset.id : null;

          if (charId && casting[charId]) {
            primaryVoiceId = casting[charId].voiceId || casting[charId];
          }
        }

        const localAudioUrl = await audioService.generateSpeech(dialogueText.trim(), primaryVoiceId);
        if (localAudioUrl) {
          setStatusText('Syncing audio tracks to the cloud...');
          // Fetch the local blob URL to convert to actual Blob
          const audioBlob = await (await fetch(localAudioUrl)).blob();
          const filePath = `users/${user?.uid || 'guest'}/audio/hobbyist-${projectData.id}-${Date.now()}.mp3`;
          finalAudioUrl = await storageService.uploadFile(filePath, audioBlob);
        }
      }

      // --- PHASE 2: GENERATE VIDEO (LIP-SYNC) ---
      setStatusText('Animating your cartoon (this may take a few minutes)...');

      // Force 'o3' model (Kling O3 Standard) for Image-to-Video interpolation with Start/End frames
      const videoUrl = await videoService.generateVideo(
        masterPrompt,
        startImgUrl,
        undefined, // DO NOT pass finalAudioUrl to prevent continuous lip-sync hallucination from Kling on short audio
        [],
        'o3',
        endImgUrl,
        "10" // Kling officially supports '5' or '10' only
      );

      if (typeof videoUrl === 'string') {
        setStatusText('Finalizing and Mixing Audio...');

        // Fetch BGM from project data
        const bgmUrl = projectData?.modules?.audio?.soundtrack || projectData?.modules?.audio?.bgm;

        // --- PHASE 3: COMBINE VIDEO AND AUDIO VIA SERVER FFMPEG ---
        let finalMuxedUrl = videoUrl;
        if (finalAudioUrl || bgmUrl) {
          try {
            const res = await fetch('/api/mux-video', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                videoUrl,
                audioUrl: finalAudioUrl,
                bgmUrl
              })
            });

            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.error || 'Server Mux Failed');
            }

            const data = await res.json();
            if (data.url) {
              // Convert data URI to Blob and upload to Firebase
              setStatusText('Uploading Final Master Video...');
              const response = await fetch(data.url);
              const blob = await response.blob();
              const fileName = `projects/${projectData.id || 'temp'}/hobbyist_master_${Date.now()}.mp4`;
              finalMuxedUrl = await storageService.uploadFile(fileName, blob);
            }
          } catch (muxErr) {
            console.error("Muxing completely failed, falling back to silent video", muxErr);
            finalMuxedUrl = videoUrl;
          }
        }

        setFinalVideoUrl(finalMuxedUrl);
        // Save to project
        if (onSave) {
          onSave({
            ...projectData,
            modules: { ...projectData.modules, hobbyistVideo: finalMuxedUrl }
          });
        }

        // Save to assets
        if (user?.uid) {
          await assetService.saveAsset(user.uid, {
            type: 'video',
            url: finalMuxedUrl,
            name: `Hobbyist Cut - ${projectData.logline?.slice(0, 30) || 'Cartoon'}...`,
            prompt: masterPrompt,
            metadata: { projectId: projectData.id, tier: 'Hobbyist' }
          });
        }
      }

    } catch (error: any) {
      console.error(error);
      alert(`Generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
      setStatusText('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white">
      <div className="flex items-center justify-between p-8 border-b border-[#262626]">
        <div>
          <h2 className="text-3xl font-black mb-2 text-white flex items-center gap-3">
            <Icon icon={ICONS.video} className="text-purple-500" size={32} />
            Director's Booth
          </h2>
          <p className="text-gray-400">Your AI studio is ready to animate your entire story in one take.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center p-4 lg:p-8 bg-grid-pattern overflow-y-auto">
        <div className="w-full max-w-4xl mt-8 mb-auto shrink-0 bg-[#141414] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden text-center relative">

          {finalVideoUrl ? (
            <div className="flex flex-col items-center w-full h-full">
              <div className="relative aspect-video bg-black w-full rounded-t-2xl overflow-hidden">
                <video src={finalVideoUrl} controls autoPlay className="w-full h-full object-contain" />
              </div>
              <div className="w-full bg-[#1a1a1a] p-4 flex justify-between items-center rounded-b-2xl border-t border-[#333] shrink-0">
                <div className="text-left">
                  <p className="text-sm text-gray-300 font-bold">Review your cut</p>
                  <p className="text-xs text-gray-500">Not happy with the AI's interpretation?</p>
                </div>
                <button
                  onClick={() => {
                    setFinalVideoUrl(null);
                    handleGenerate();
                  }}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-[#262626] hover:bg-purple-900/40 border border-[#444] hover:border-purple-500/50 rounded-lg text-sm text-white font-bold transition-all flex items-center gap-2"
                >
                  <Icon icon={ICONS.refresh || ICONS.magic} size={16} /> Re-Generate (Auto & Video)
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 px-6 lg:py-12 lg:px-8 flex flex-col items-center w-full min-h-[400px] justify-center relative">

              {isGenerating ? (
                <div className="absolute inset-0 bg-[#141414]/90 flex flex-col items-center justify-center backdrop-blur-md z-10 p-8 rounded-2xl animate-in fade-in transition-all">
                  <Icon icon={ICONS.spinner} size={48} className="text-purple-500 animate-spin mb-6" />
                  <h3 className="text-xl font-bold text-white mb-2 tracking-wide animate-pulse text-center">{statusText}</h3>
                  <p className="text-gray-400 text-sm text-center">Orchestrating AI models... please do not close this page.</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-purple-900/20 rounded-full flex items-center justify-center mb-4 shrink-0">
                    <Icon icon={ICONS.magic} size={32} className="text-purple-500" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">Ready to Automate</h3>
                  <p className="text-gray-400 max-w-md mx-auto mb-6 text-xs lg:text-sm">
                    We will interpolate the keyframes below using the cinematic master prompt.
                  </p>

                  {/* KEYFRAMES PREVIEW */}
                  <div className="flex gap-4 mb-6 w-full justify-center shrink-0">
                    <div className="flex flex-col gap-2 relative">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-left">Start Frame</span>
                      <div className="w-32 lg:w-48 aspect-video bg-black rounded-lg border-2 border-[#333] overflow-hidden">
                        {startImgUrl ? (
                          <img src={startImgUrl} alt="Start Keyframe" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-2">
                            <Icon icon={ICONS.image} size={24} />
                            <span className="text-[10px] font-bold">Missing</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {endImgUrl && (
                      <div className="flex flex-col gap-2 relative">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-left">End Frame</span>
                        <div className="w-32 lg:w-48 aspect-video bg-black rounded-lg border-2 border-[#333] overflow-hidden">
                          <img src={endImgUrl} alt="End Keyframe" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MASTER PROMPT PREVIEW */}
                  <div className="w-full max-w-2xl bg-[#0a0a0a] rounded-xl p-3 border border-[#333] text-left mb-6 shrink-0">
                    <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                      <Icon icon={ICONS.pen} size={12} /> Master Prompt
                    </div>
                    <p className="text-xs text-gray-300 font-mono leading-relaxed line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">
                      {masterPrompt}
                    </p>
                  </div>

                  {isReadyToGenerate ? (
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="px-8 py-3 lg:py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold text-base lg:text-lg hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-3 shrink-0"
                    >
                      <Icon icon={ICONS.magic} size={20} /> Generate Sequence
                    </button>
                  ) : (
                    <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl shrink-0">
                      <p className="text-yellow-500 font-bold mb-2 flex items-center justify-center gap-2">
                        <Icon icon={ICONS.warning} /> Action Required
                      </p>
                      <p className="text-sm text-yellow-500/80">You must render at least one shot in the Script Phase before animating.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        </div>
      </div>

      <div className="p-6 border-t border-[#262626] flex justify-between items-center bg-[#0a0a0a]">
        <button onClick={onBack} className="px-6 py-3 rounded-xl border border-[#333] hover:bg-[#1a1a1a] text-gray-300 font-bold transition-all">
          Back to Script
        </button>
        <button
          onClick={onNext}
          disabled={!finalVideoUrl && !isGenerating}
          className="px-8 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          {isGenerating ? 'Please Wait...' : 'Continue to Final Review'} <Icon icon={ICONS.chevronRight} size={16} />
        </button>
      </div>

    </div>
  );
}
