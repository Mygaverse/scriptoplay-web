'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { ICONS } from '@/config/icons';
import { videoService } from '@/services/videoService';
import { imageService } from '@/services/imageService';
import { useAuth } from '@/context/AuthContext';
import { assetService } from '@/services/assetService';
import { motion, AnimatePresence } from 'framer-motion';
import { VISUAL_STYLES, getStyleConfig } from '@/config/styles';
import HobbyistProductionPhase from './HobbyistProductionPhase';

// --- Types ---
type ScriptScene = {
  id: string;
  header: string;
  action: string;
  visual_prompt?: string;
  visual_prompt_motion?: string;
  production_image?: string; // Keyframe
  production_video?: string; // Result
  camera?: any;
  lighting?: string;
  dialogue?: Array<{ character: string; line: string; parenthetical?: string; audio_url?: string }>;
  tags?: string[]; // Smart Routing Tags
};

type ProductionPhaseProps = {
  projectData: any;
  onBack: () => void;
  onSave?: (data: any) => void;
  onNext: () => void;
  versions?: any[];
  onSaveVersion?: () => void;
  isHobbyist?: boolean;
};

// --- Action Chips Configuration ---
const ACTION_CHIPS = [
  { label: 'Slow Motion', suffix: 'in slow motion, high speed camera, 60fps' },
  { label: 'Explosive', suffix: 'explosive action, dynamic debris, high energy, impact' },
  { label: 'Fluid', suffix: 'fluid motion, smooth continuous movement, graceful' },
  { label: 'Shaky Cam', suffix: 'handheld camera shake, intense chaotic movement, documentary style' },
  { label: 'Cinematic', suffix: 'cinematic lighting, shallow depth of field, anamorphic lens flares' },
];

export default function ProductionPhase({ projectData, onBack, onSave, onNext, versions = [], onSaveVersion, isHobbyist }: ProductionPhaseProps) {
  const { user } = useAuth();

  // Hobbyist Branching
  if (isHobbyist) {
    return (
      <HobbyistProductionPhase
        projectData={projectData}
        onBack={onBack}
        onNext={onNext}
        onSave={onSave}
      />
    );
  }

  // --- State ---
  // Initialize local scenes from project data
  const [scenes, setScenes] = useState<ScriptScene[]>(projectData.modules?.script || []);
  const [selectedSceneId, setSelectedSceneId] = useState<string>(scenes.length > 0 ? scenes[0].id : '');

  const [generatingVideos, setGeneratingVideos] = useState<Record<string, string>>({}); // sceneId -> status
  const [modelPreference, setModelPreference] = useState<'fast' | 'quality' | 'auto'>('auto');
  const [isExporting, setIsExporting] = useState(false);
  const [isAutoAnimating, setIsAutoAnimating] = useState(false);
  const [viewMode, setViewMode] = useState<'scenes' | 'history'>('scenes');

  const [showModelWarning, setShowModelWarning] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<'auto' | 'fast' | 'quality'>('auto');

  // Sync state if props change (e.g. restore version)
  useEffect(() => {
    if (projectData.modules?.script) {
      setScenes(projectData.modules.script);
      if (!selectedSceneId && projectData.modules.script.length > 0) {
        setSelectedSceneId(projectData.modules.script[0].id);
      }
    }
  }, [projectData.modules?.script]);

  // Derived
  const selectedScene = scenes.find(s => s.id === selectedSceneId);

  // --- Helpers ---
  const autoSave = (newScenes: ScriptScene[]) => {
    if (onSave) {
      onSave({
        ...projectData,
        modules: { ...projectData.modules, script: newScenes }
      });
    }
  };

  const updateScene = (id: string, updates: Partial<ScriptScene>) => {
    let newScenes: ScriptScene[] = [];
    setScenes(prev => {
      newScenes = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      return newScenes;
    });
    // Break the react cycle to ensure onSave gets the fresh array
    setTimeout(() => autoSave(newScenes), 0);
  };

  const updateSceneVideo = (sceneId: string, videoUrl: string) => {
    updateScene(sceneId, { production_video: videoUrl });
  };

  const pollVideoStatus = async (sceneId: string, generationId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await videoService.checkStatus(generationId);

        if (status.state === 'completed') {
          clearInterval(interval);
          setGeneratingVideos(prev => ({ ...prev, [sceneId]: 'completed' }));
          updateScene(sceneId, { production_video: status.assets?.video });
        } else if (status.state === 'failed') {
          clearInterval(interval);
          setGeneratingVideos(prev => ({ ...prev, [sceneId]: 'failed' }));
          alert(`Generation Failed: ${status.failure_reason}`);
        }
      } catch (e) {
        clearInterval(interval);
        setGeneratingVideos(prev => ({ ...prev, [sceneId]: 'failed' }));
      }
    }, 4000);
  };

  // Reusable generation function (internal)
  const generateSingleSceneVideo = async (scene: ScriptScene, overrideModel?: 'auto' | 'fast' | 'quality') => {
    const sceneId = scene.id;
    setGeneratingVideos(prev => ({ ...prev, [sceneId]: 'dreaming' }));

    try {
      // 1. Semantic Stability
      const stabilityTags = "steady camera, no flicker, 24fps, cinematic movement, masterpiece, fluid motion";
      // 2. Negative Constraints
      const negativeConstraints = "no morphing, no extra limbs, stable motion, no text, no watermarks, no blur";

      // 3. Smart Prompt Logic
      // Lookup the project style setting to strictly enforce it
      const styleConfig = getStyleConfig(projectData.modules?.style || projectData.style);
      const styleModifier = styleConfig.prompt;

      let finalPrompt = "";
      if (scene.production_image && scene.visual_prompt_motion) {
        // I2V: Motion Prompt + Style Injection to prevent 3D drift
        finalPrompt = `${scene.visual_prompt_motion}. Style: ${styleModifier}. ${stabilityTags}`;
      } else {
        // T2V: Static + Motion + Hardcoded Style Injection
        const vPrompt = scene.visual_prompt || "";
        const mPrompt = scene.visual_prompt_motion || "";
        finalPrompt = `${vPrompt} ${mPrompt}. Style: ${styleModifier}. ${stabilityTags}`;
      }

      // 4. Ref Tags
      const refTags = scene.production_image ? ` --cref ${scene.production_image} --cw 100` : "";

      const enhancedPrompt = `${finalPrompt} --no ${negativeConstraints}${refTags}`;

      // Check for dialogue audio (Lip-Sync)
      const audioUrl = scene.dialogue?.find(d => d.audio_url)?.audio_url;

      // Smart Routing: Pass tags to videoService
      const finalModel = overrideModel || modelPreference;
      const videoResult = await videoService.generateVideo(enhancedPrompt, scene.production_image, audioUrl, scene.tags, finalModel);

      if (typeof videoResult === 'string' && videoResult.startsWith('http')) {
        // Success
        // Need to update local state too because the helper 'updateScene' relies on 'scenes' state which might be stale in a loop?
        // setState with callback is safer.
        let updatedScenes: ScriptScene[] = [];
        setScenes(prev => {
          updatedScenes = prev.map(s => s.id === sceneId ? { ...s, production_video: videoResult } : s);
          return updatedScenes;
        });
        setGeneratingVideos(prev => ({ ...prev, [sceneId]: 'completed' }));
        setTimeout(() => autoSave(updatedScenes), 0);

        // --- PERSIST TO ASSETS LIBRARY ---
        if (user?.uid) {
          try {
            await assetService.saveAsset(user.uid, {
              type: 'video',
              url: videoResult,
              name: `Scene ${sceneId} - ${enhancedPrompt.slice(0, 30)}...`,
              prompt: enhancedPrompt,
              metadata: {
                sceneId: sceneId,
                projectId: projectData.id,
                style: projectData.modules?.style || 'default'
              }
            });
            console.log("Video asset saved to library");
          } catch (err) {
            console.error("Failed to save video asset", err);
          }
        }

        return videoResult;
      } else {
        throw new Error("Invalid result format");
      }
    } catch (e) {
      console.error(`Scene ${sceneId} Generation Failed:`, e);
      setGeneratingVideos(prev => ({ ...prev, [sceneId]: 'failed' }));
      return null;
    }
  };

  const handleGenerateVideo = async () => {
    if (!selectedScene) return;
    const url = await generateSingleSceneVideo(selectedScene);
    if (url) updateSceneVideo(selectedScene.id, url);
  };

  const handleAutoAnimate = async (engine: 'auto' | 'fast' | 'quality' = 'auto') => {
    setIsAutoAnimating(true);
    // Determine if we are "Regenerating All" or "Filling Gaps"
    // If all scenes have video, we regenerate all.
    // If some are missing, we only do missing.
    const allHaveVideo = scenes.every(s => s.production_video);
    const targetScenes = allHaveVideo ? scenes : scenes.filter(s => !s.production_video);

    console.log(`Auto-Animate: Processing ${targetScenes.length} scenes...`);

    for (const scene of targetScenes) {
      // Scroll to scene or select it? (Optional visual feedback)
      setSelectedSceneId(scene.id);

      // Wait for generation (Sequential)
      // Note: generateSingleSceneVideo now securely fires autoSave on completion!
      await generateSingleSceneVideo(scene, engine);
    }

    setIsAutoAnimating(false);
    alert("Auto-Animation Complete!");
  };

  const handleGenerateKeyframe = async () => {
    if (!selectedScene) return;
    const sceneId = selectedScene.id;

    // Optimistic UI updates could go here

    try {
      // 1. Find Reference Asset (Consistency)
      // Simple name matching from dialogue or we could add a parsed 'characterId' field later.
      // For now, let's look at the first speaking character or mentioned asset.
      let consistencyRef = undefined;

      if (projectData?.modules?.assets) {
        // Get first character in dialogue
        const mainCharName = selectedScene.dialogue?.[0]?.character;
        if (mainCharName) {
          const asset = projectData.modules.assets.find((a: any) => a.name.toLowerCase() === mainCharName.toLowerCase());
          if (asset?.consistencyRef) {
            consistencyRef = asset.consistencyRef;
            console.log(`Using consistency ref for ${mainCharName}:`, consistencyRef);
          } else if (asset?.image) {
            // Fallback to the asset's main image if no specific ref set
            consistencyRef = asset.image;
            console.log(`Using asset image as ref for ${mainCharName}:`, consistencyRef);
          }
        }
      }

      // Lookup the project style setting to strictly enforce it
      const styleConfig = getStyleConfig(projectData.modules?.style || projectData.style);
      const enhancedVisualPrompt = `${selectedScene.visual_prompt || selectedScene.action}, Style: ${styleConfig.prompt}`;

      // 2. Generate Image
      // Use the Static Prompt alongside forced style modifier
      const imageUrl = await imageService.generate(
        enhancedVisualPrompt,
        "16:9",
        { char_ref: consistencyRef }
      );

      // 3. Update Scene
      updateScene(sceneId, { production_image: imageUrl });

    } catch (e: any) {
      console.error("Keyframe gen failed", e);
      alert("Failed to generate keyframe: " + e.message);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      onNext();
    }, 1000);
  };

  return (
    <div className="flex h-full bg-[#0a0a0a] text-white overflow-hidden font-sans">

      {/* COLUMN 1: THE BIN (Left Panel) */}
      <div className="w-80 border-r border-[#262626] flex flex-col bg-[#0f0f0f]">
        <div className="h-14 px-4 border-b border-[#262626] flex items-center justify-between">
          <div className="flex gap-4">
            <button
              onClick={() => setViewMode('scenes')}
              className={`text-xs font-bold uppercase tracking-widest transition-colors ${viewMode === 'scenes' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
            >
              Scene Bin
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`text-xs font-bold uppercase tracking-widest transition-colors ${viewMode === 'history' ? 'text-purple-400' : 'text-gray-600 hover:text-gray-400'}`}
            >
              History
            </button>
          </div>
          <span className="text-xs text-gray-600">{viewMode === 'scenes' ? `${scenes.length} Scenes` : `${versions.filter((v: any) => v.phase === 'production').length} Vers`}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-800">
          {viewMode === 'scenes' ? (
            // SCENES LIST
            scenes.map((scene, i) => {
              const status = generatingVideos[scene.id];
              const isSelected = scene.id === selectedSceneId;

              return (
                <div
                  key={scene.id}
                  onClick={() => setSelectedSceneId(scene.id)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all flex gap-3 ${isSelected ? 'bg-[#1a1a1a] border-purple-500 shadow-lg shadow-purple-900/20' : 'bg-[#141414] border-transparent hover:border-[#333]'}`}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-12 bg-black rounded overflow-hidden flex-shrink-0 relative border border-[#262626]">
                    {scene.production_image ? (
                      <img src={scene.production_image} className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700">
                        <Icon icon={ICONS.image} size={12} />
                      </div>
                    )}
                    {/* Status Dot */}
                    <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${status === 'completed' || scene.production_video ? 'bg-green-500' : status === 'dreaming' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-700'}`} />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs truncate text-gray-300">SCENE {i + 1}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">{scene.header}</p>
                  </div>
                </div>
              )
            })
          ) : (
            // HISTORY LIST
            versions.filter((v: any) => v.phase === 'production').length === 0 ? (
              <div className="text-center text-gray-600 text-xs py-8">No saved versions found.</div>
            ) : (
              versions.filter((v: any) => v.phase === 'production').map((v: any) => (
                <div key={v.id} className="p-3 bg-[#141414] border border-[#262626] rounded-xl flex flex-col gap-2 hover:border-gray-600 transition-colors group">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Icon icon={ICONS.clock} size={12} />
                      <span className="text-xs font-mono">{v.timestamp?.toDate ? v.timestamp.toDate().toLocaleString() : 'Unknown Date'}</span>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm("Restore this production state? (This will overwrite current scenes)")) {
                          if (onSave && v.snapshotData) {
                            onSave(v.snapshotData);
                            setViewMode('scenes'); // Switch back to view result
                          }
                        }
                      }}
                      className="text-[10px] font-bold text-purple-400 hover:text-purple-300 bg-purple-900/20 px-2 py-1 rounded"
                    >
                      RESTORE
                    </button>
                  </div>
                  <div className="text-[10px] text-gray-600">
                    {v.snapshotData?.modules?.script?.length || 0} Scenes • {Object.keys(v.snapshotData?.modules?.assets || {}).length} Assets
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* Export / Back - Fixed Height */}
        <div className="h-24 p-4 border-t border-[#262626] bg-[#0a0a0a] flex flex-col justify-center gap-2">
          {onSaveVersion && (
            <button onClick={onSaveVersion} className="w-full py-1.5 text-[10px] text-gray-500 hover:text-white border border-[#333] rounded transition-colors">
              Save Version Snapshot
            </button>
          )}
          <button onClick={onBack} className="w-full py-2 flex items-center justify-center gap-2 text-gray-500 hover:text-white text-xs transition-colors">
            <Icon icon={ICONS.chevronLeft} size={12} /> Back to Script
          </button>
        </div>
      </div>

      {/* COLUMN 2: THE STAGE (Center Panel) */}
      <div className="flex-1 flex flex-col bg-black relative">
        {/* Top Bar - UNIFIED STYLE */}
        <div className="h-14 px-4 border-b border-[#262626] flex items-center justify-between bg-[#0f0f0f]">
          <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Icon icon={ICONS.video} className="text-pink-500" />
            Director's View
          </h2>
          <div className="flex gap-2">
            {/* Auto-Animate Button */}
            <button
              onClick={() => setShowModelWarning(true)}
              disabled={isAutoAnimating}
              className={`px-3 py-1.5 text-[10px] font-bold rounded border transition-all flex items-center gap-2
                    ${isAutoAnimating
                  ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30 animate-pulse'
                  : 'bg-[#1a1a1a] text-gray-300 border-[#333] hover:text-white hover:border-gray-500'
                }`}
            >
              <Icon icon={isAutoAnimating ? ICONS.spinner : ICONS.magic} className={isAutoAnimating ? 'animate-spin' : ''} />
              {isAutoAnimating ? 'ANIMATING SCENES...' : scenes.every(s => s.production_video) ? 'REGENERATE ALL' : 'AUTO-ANIMATE SHOTS'}
            </button>
          </div>
        </div>

        {/* Stage Viewport */}
        <div className="flex-1 flex items-center justify-center p-8 bg-grid-pattern relative overflow-hidden group">
          {selectedScene ? (
            <div className="relative aspect-video w-full max-w-4xl bg-black border border-[#333] shadow-2xl rounded-lg overflow-hidden ring-1 ring-white/10 group-hover:ring-pink-500/30 transition-all">
              {/* Content */}
              {selectedScene.production_video ? (
                <video src={selectedScene.production_video} controls className="w-full h-full object-contain bg-[#050505]" />
              ) : selectedScene.production_image ? (
                <img src={selectedScene.production_image} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
                  <Icon icon={ICONS.image} size={48} className="mb-4 opacity-20" />
                  <p className="text-sm font-mono">No Visuals Generated</p>
                </div>
              )}

              {/* Overlay: Status */}
              {generatingVideos[selectedScene.id] === 'dreaming' && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
                  <Icon icon={ICONS.spinner} size={40} className="text-pink-500 animate-spin mb-4" />
                  <p className="text-pink-500 font-mono text-sm tracking-widest animate-pulse">RENDERING SCENE...</p>
                </div>
              )}

              {/* Overlay: Grid (Optional, visual candy) */}
              <div className="absolute inset-0 pointer-events-none border border-white/5 grid grid-cols-3 grid-rows-3 opacity-20" />
            </div>
          ) : (
            <div className="text-gray-500">Select a scene to begin</div>
          )}
        </div>

        {/* Transport Controls (Bottom of Stage) */}
        <div className="h-24 border-t border-[#262626] bg-[#0a0a0a] flex items-center justify-center gap-6 px-4">
          {selectedScene && (
            <>
              <div className="text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Status</p>
                <div className={`text-xs font-bold ${selectedScene.production_video ? 'text-green-500' : 'text-yellow-500'}`}>
                  {selectedScene.production_video ? 'READY' : 'PENDING'}
                </div>
              </div>

              {/* MODEL SELECTOR */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest">Model Engine</label>
                <select
                  value={modelPreference}
                  onChange={(e) => setModelPreference(e.target.value as any)}
                  className="bg-[#1a1a1a] border border-[#333] text-[10px] text-gray-300 rounded px-2 py-1 focus:outline-none focus:border-purple-500"
                >
                  <option value="auto">Auto (Smart)</option>
                  <option value="fast">Fast (Luma ~45s)</option>
                  <option value="quality">Pro (Kling 1.6 ~7m)</option>
                </select>
              </div>

              <button
                onClick={handleGenerateVideo}
                disabled={generatingVideos[selectedScene.id] === 'dreaming'}
                className="h-8 px-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full text-white font-bold hover:shadow-lg hover:shadow-pink-500/20 active:scale-95 transition-all text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <Icon icon={ICONS.magic} />
                {selectedScene.production_video ? 'RE-ANIMATE' : 'ANIMATE SHOT'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* COLUMN 3: THE DESK (Right Panel) */}
      <div className="w-96 border-l border-[#262626] bg-[#0f0f0f] flex flex-col">
        {/* Right Header - Fixed */}
        <div className="h-14 px-4 border-b border-[#262626] flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-white">Scene Details</span>
          <span className="text-[10px] text-gray-600 font-mono">#{selectedSceneId.substring(0, 4)}</span>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 p-6 space-y-8">
          {/* ... Content omitted, same as before ... */}
          {selectedScene ? (
            <>
              {/* SECTION 1: VISUAL CONTROLS */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Visual Controls</h3>
                {/* ... */}
                {/* Scene Info */}
                <div className="bg-[#1a1a1a] rounded-lg p-3 mb-6 border border-[#262626]">
                  <span className="text-[10px] text-purple-400 font-bold uppercase block mb-1">Current Action</span>
                  <p className="text-xs text-gray-300 leading-relaxed">{selectedScene.action}</p>
                </div>

                {/* ACTION CHIPS - GENERATIVE UI */}
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase mb-3 block flex justify-between">
                    <span>Motion Modifiers</span>
                    <span className="text-purple-500 cursor-help">Add Effect</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ACTION_CHIPS.map(chip => (
                      <button
                        key={chip.label}
                        onClick={() => {
                          const current = selectedScene.visual_prompt_motion || '';
                          if (!current.includes(chip.suffix)) {
                            updateScene(selectedScene.id, {
                              visual_prompt_motion: `${current}, ${chip.suffix}`
                            });
                          }
                        }}
                        className="px-2.5 py-1.5 bg-[#1a1a1a] border border-[#333] hover:border-purple-500/50 hover:text-purple-300 rounded-md text-[10px] text-gray-400 transition-all font-medium"
                      >
                        + {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <hr className="border-[#262626]" />

              {/* SECTION 2: CAMERA & LIGHTING */}
              <div>
                {/* CAMERA CONTROL */}
                <div className="mb-8">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <Icon icon={ICONS.video} size={10} /> Camera Logic
                  </h4>
                  <textarea
                    value={selectedScene.visual_prompt_motion || ''}
                    onChange={(e) => updateScene(selectedScene.id, { visual_prompt_motion: e.target.value })}
                    className="w-full h-32 bg-[#1a1a1a] border border-[#333] rounded-xl p-3 text-xs text-yellow-500/90 font-mono focus:outline-none focus:border-yellow-500/50 resize-none leading-relaxed"
                    placeholder="Describe camera movement and action..."
                  />
                </div>

                {/* LIGHTING CONTROL */}
                <div className="mb-8">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <Icon icon={ICONS.sparkles} size={10} /> Lighting & Atmosphere
                  </h4>
                  <select
                    value={selectedScene.lighting || ''}
                    onChange={(e) => updateScene(selectedScene.id, { lighting: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-2 text-xs text-gray-300 focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Default Vibe</option>
                    <option value="Golden Hour">Golden Hour</option>
                    <option value="Rim Lighting">Rim Lighting</option>
                    <option value="Volumetric">Volumetric (God Rays)</option>
                    <option value="Neon">Neon / Cyberpunk</option>
                    <option value="Noir">Noir / Low Key</option>
                  </select>
                </div>

                {/* READ-ONLY STATIC WITH GENERATOR */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-[10px] font-bold text-gray-600 uppercase">Static Prompt (Keyframe)</h4>
                    <button
                      onClick={handleGenerateKeyframe}
                      className="text-[10px] bg-purple-900/40 text-purple-400 hover:bg-purple-900/60 px-2 py-1 rounded border border-purple-500/30 font-bold flex items-center gap-1"
                    >
                      <Icon icon={ICONS.image} size={10} />
                      {selectedScene.production_image ? 'Regenerate' : 'Generate'}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-600 font-mono leading-tight bg-[#0a0a0a] p-2 rounded border border-[#222]">
                    {selectedScene.visual_prompt || "No static prompt"}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-700 text-xs uppercase tracking-widest">
              No Details
            </div>
          )}
        </div>

        {/* Right Footer - Fixed */}
        <div className="h-24 p-4 border-t border-[#262626] bg-[#0a0a0a] flex items-center justify-center">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full h-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Icon icon={ICONS.magic} />
            {isExporting ? 'PREPARING POST-PRODUCTION...' : 'CONTINUE TO POST-PRODUCTION'}
          </button>
        </div>
      </div>

      {/* MODEL WARNING MODAL */}
      {showModelWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200 pointer-events-auto">
          <div className="bg-[#141414] border border-[#333] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Icon icon={ICONS.warning} className="text-yellow-500" />
                Video Generation Engine
              </h3>
              <p className="text-gray-400 text-sm mb-6">Select your preferred rendering engine for character consistency and fidelity.</p>

              <div className="space-y-4 mb-6">
                <label className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Engine Selection</span>
                  <select
                    value={selectedEngine}
                    onChange={(e) => setSelectedEngine(e.target.value as any)}
                    className="bg-[#0a0a0a] border border-[#333] text-gray-200 text-sm rounded-lg p-3 outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="auto">Auto (Smart Selection)</option>
                    <option value="fast">Fast (Luma ~45s)</option>
                    <option value="quality">Quality (Kling 1.6 ~7m)</option>
                  </select>
                </label>

                <div className="bg-[#262626]/50 border border-yellow-500/20 p-4 rounded-xl text-sm">
                  {selectedEngine === 'auto' && (
                    <p className="text-gray-300">
                      <strong className="text-yellow-500 block mb-1">Notice:</strong>
                      The model will be selected automatically based on the scene context. Quality models may be selected for complex scenes. Please be prepared to wait.
                    </p>
                  )}
                  {selectedEngine === 'fast' && (
                    <p className="text-gray-300">
                      <strong className="text-yellow-500 block mb-1">Heads up:</strong>
                      Videos will be generated rapidly, but visual quality and motion stability may be lower.
                    </p>
                  )}
                  {selectedEngine === 'quality' && (
                    <p className="text-gray-300">
                      <strong className="text-yellow-500 block mb-1">Warning: Select with caution</strong>
                      Generation will take significantly longer to prioritize the best possible quality and detail.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#262626] mt-4 pt-4">
                <button
                  onClick={() => setShowModelWarning(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#262626] text-gray-300 hover:text-white hover:bg-[#333] transition-colors text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowModelWarning(false);
                    handleAutoAnimate(selectedEngine);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/40 text-sm flex items-center gap-2"
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
