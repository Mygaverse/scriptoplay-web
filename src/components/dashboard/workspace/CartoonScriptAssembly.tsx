'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { ICONS } from '@/config/icons';
import { aiService } from '@/services/aiService';
import { imageService } from '@/services/imageService';
import { audioService } from '@/services/audioService';
import { useAuth } from '@/context/AuthContext';
import { assetService } from '@/services/assetService';
import { storageService } from '@/services/storageService';
import { VISUAL_STYLES, getStyleConfig } from '@/config/styles';
import ShotPreviewModal from '@/components/shared/ShotPreviewModal';

// --- Types ---
type ScriptScene = {
  id: string;
  header: string; // e.g. INT. KITCHEN - DAY
  action: string;
  dialogue: Array<{ character: string; line: string; parenthetical?: string; audio_url?: string }>;
  sfx: string; // "LOUD BOING"
  camera: string; // "ZOOM IN"
  visual_context: string; // "See Asset: Protagonist"
  visual_prompt?: string; // The STATIC KEYFRAME prompt (High detail, lighting, style)
  visual_prompt_motion?: string; // The MOTION ONLY prompt (Action + Camera, for I2V)
  production_image?: string; // The generated image URL
};

type CartoonScriptAssemblyProps = {
  logline: string;
  beats: any[];
  assets: any[]; // VisualAsset[]
  config: any;   // Project Config (Genre, Audience, etc)
  onNext: (script: ScriptScene[]) => void;
  onBack: () => void;
  versions?: any[];
  onSaveVersion?: () => void;
  onSave?: (script: ScriptScene[]) => void;
  isHobbyist?: boolean;
};

export default function CartoonScriptAssembly({ logline, beats, assets, config, onNext, onBack, versions = [], onSaveVersion, onSave, isHobbyist }: CartoonScriptAssemblyProps) {

  const { user } = useAuth();
  const [script, setScript] = useState<ScriptScene[]>([]);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatingSceneId, setGeneratingSceneId] = useState<string | null>(null);

  // 1. Hydrate from Config (Persistence Fix)
  React.useEffect(() => {
    if (config?.modules?.script && config.modules.script.length > 0) {
      setScript(config.modules.script);
    } else if (!isGeneratingScript && (!config?.modules?.script || config.modules.script.length === 0)) {
      // AUTO-GENERATE SCRIPT ON MOUNT IF EMPTY
      handleGenerateScript();
    }
  }, [config]); // Dependency on config ensuring we wait for it to load

  const [isGeneratingAllShots, setIsGeneratingAllShots] = useState(false);
  const stopShotsRef = React.useRef(false);

  // 2. Auto-Save Helper
  const autoSave = (newScript: ScriptScene[]) => {
    if (onSave) {
      onSave(newScript);
    }
  };

  const handleGenerateScript = async () => {
    setIsGeneratingScript(true);
    try {
      // Prepare context
      // Prepare context
      const beatContext = beats.map((b, i) =>
        `Beat ${i + 1} (${b.type}): ${b.visual} 
         [Camera: ${b.camera?.move || ''} ${b.camera?.angle || ''}] 
         [Lighting: ${b.lighting || ''}] 
         [Sound: ${b.audio}]
         [Tags: ${(b.tags || []).join(', ')}]`
      ).join('\n---\n');

      const assetContext = assets.map(a =>
        `${a.name} (${a.type}): ${a.desc} ${a.consistencyLock ? `[VISUAL LOCK: ${a.consistencyLock}]` : ''}`
      ).join('\n');

      // LOOKUP STYLE
      const styleConfig = getStyleConfig(config?.modules?.style || config?.style);
      const styleInfo = `VISUAL STYLE: ${styleConfig.label} (${styleConfig.prompt})`;

      const prompt = `
            Act as a Lead TV Animation Writer & Director.
            Project: ${logline}
            Genre: ${config?.genre || 'Comedy'}
            Audience: ${config?.audience || 'General'}
            Vibe: ${config?.vibe || 'Fun and adventurous'}
            Theme: ${config?.theme || 'Friendship'}
            Pacing/Format Length: ${config?.length || '3 Minutes'}
            ${config?.length === '15s' || config?.length === 'Micro-Short (15-30s)' ? 'CRITICAL LENGTH DIRECTIVE: This is a Micro-Short. You MUST generate EXACTLY 2 scenes: Scene 1 establishes the Start State, and Scene 2 establishes the End State / Punchline.' : ''}
            Dialogue Style: ${config?.audioConfig?.dialogue || 'Standard'}
            ${styleInfo}
            
            STRICT DIRECTIVES:
            - You MUST adhere to the Vibe ("${config?.vibe || 'Fun'}") and Theme ("${config?.theme || 'None'}") in every scene's tone.
            - The script pacing MUST match a ${config?.length || '3m'} runtime format.
            - Dialogue MUST strictly follow the ${config?.audioConfig?.dialogue || 'Standard'} style.

            MASTER PROMPT FORMULA for visual_prompt (STATIC KEYFRAME):
            1. Subject & Action (Kinetic Core)
            2. Environment (The Set)
            3. Visual Style (The Anchor) - ${styleConfig.label}
            4. Lighting (The Vibe) - Use the Beat's Lighting
            5. Camera (Directorial Command) - Use the Beat's Camera 
            6. Technical Tags (The Lock) - Will be appended by system.

            MODEL-SPECIFIC OPTIMIZATION (Smart Routing):
            - IF Tag is 'Character' OR 'Dialogue': Inject "mid-shot, expressive facial features, detailed eyes, consistent character identity, studio lighting" into visual_prompt.
            - IF Tag is 'Action' OR 'Physics': Inject "wide shot, fluid motion, dynamic camera, action blur, cinematic physics" into visual_prompt_motion.
            - IF Tag is 'Environment': Inject "establishing shot, high detail environment, volumetric lighting, 8k texture" into visual_prompt.

            ASSETS (Consistency Anchors):
            ${assetContext}

            STORY BEATS (Directorial Map):
            ${beatContext}

            Task: Write the full script scene-by-scene AND provide a PRECISE visual prompt for each shot.
            
            Format: JSON Array of Scenes.
            Included fields:
            - header (Standard slugline)
            - action (Vivid description of visual action. Apply Animation Principles.)
            - sfx (Sound effects in ALL CAPS)
            - camera (Camera directions like PAN, ZOOM, TRUCK - Use the [Camera] data from beats)
            - dialogue (Array of objects: character, line, parenthetical)
            - visual_prompt (STATIC KEYFRAME PROMPT: [Visual Style] + [Consistency Lock] + [subject description] + [Environment] + [Lighting])
            - visual_prompt_motion (MOTION PROMPT: [Subject Action with *ADVERBS*] + [Camera Move] + [Visual Style] + [Model Keywords]. Ensure the Visual Style is explicitly included to prevent style drift during animation.)
        `;

      const result = await aiService.generateStructured(prompt);
      if (Array.isArray(result)) {
        const newScript = result.map((s: any) => ({ ...s, id: Math.random().toString() }));
        setScript(newScript);
        autoSave(newScript); // Immediate Save
      }

    } catch (e) {
      console.error(e);
      alert("Script generation failed. Please try again.");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Helper to find consistency ref
  const findConsistencyRef = (scene: any) => {
    if (!assets || assets.length === 0) return undefined;

    // 1. Check Dialogue Speakers (Priority)
    if (scene.dialogue && scene.dialogue.length > 0) {
      const speakerName = scene.dialogue[0].character;
      const asset = assets.find((a: any) => a.name.toLowerCase() === speakerName.toLowerCase());
      if (asset?.consistencyLock) return asset.consistencyLock;
      if (asset?.image) return asset.image;
    }

    // 2. Check Action/Header for Character Names
    for (const asset of assets) {
      if (asset.type === 'Character' && (scene.action.includes(asset.name) || scene.header.includes(asset.name))) {
        if (asset.consistencyLock) return asset.consistencyLock;
        if (asset.image) return asset.image;
      }
    }
    return undefined;
  };

  const handleGenerateShot = async (sceneId: string) => {
    const scene = script.find(s => s.id === sceneId);
    if (!scene || !scene.visual_prompt) return;

    setGeneratingSceneId(sceneId);
    try {
      const consistencyRef = findConsistencyRef(scene);
      console.log(`Generating shot for scene ${sceneId} with ref:`, consistencyRef);

      const styleConfig = getStyleConfig(config?.modules?.style || config?.style);
      const enhancedPrompt = `${scene.visual_prompt}, Style: ${styleConfig.prompt}`;

      const imageUrl = await imageService.generate(enhancedPrompt, "16:9", { char_ref: consistencyRef }); // Cinematic aspect ratio

      let generatedScript: ScriptScene[] = [];
      setScript(prev => {
        generatedScript = prev.map(s => s.id === sceneId ? { ...s, production_image: imageUrl } : s);
        return generatedScript;
      });
      // Defer autoSave to avoid 'Cannot update component while rendering' warning
      setTimeout(() => autoSave(generatedScript), 0);
    } catch (e) {
      console.error(e);
      alert("Shot generation failed");
    } finally {
      setGeneratingSceneId(null);
    }
  };

  const handleGenerateAllShots = async () => {
    if (script.length === 0) return;
    setIsGeneratingAllShots(true);
    stopShotsRef.current = false;

    for (const scene of script) {
      if (stopShotsRef.current) break;
      if (scene.production_image) continue; // Skip existing

      if (!scene.visual_prompt) continue;

      setGeneratingSceneId(scene.id);
      try {
        const consistencyRef = findConsistencyRef(scene);
        console.log(`Auto-generating shot for scene ${scene.id} with ref:`, consistencyRef);

        const styleConfig = getStyleConfig(config?.modules?.style || config?.style);
        const enhancedPrompt = `${scene.visual_prompt}, Style: ${styleConfig.prompt}`;

        const imageUrl = await imageService.generate(enhancedPrompt, "16:9", { char_ref: consistencyRef });

        let generatedScript: ScriptScene[] = [];
        // Update State & Auto Save
        setScript(prev => {
          generatedScript = prev.map(s => s.id === scene.id ? { ...s, production_image: imageUrl } : s);
          return generatedScript;
        });
        setTimeout(() => autoSave(generatedScript), 0);

      } catch (e) {
        console.error(`Failed to generate shot for scene ${scene.id}`, e);
        // Continue to next despite error
      }
    }
    setGeneratingSceneId(null);
    setIsGeneratingAllShots(false);
  };

  const stopGeneration = () => {
    stopShotsRef.current = true;
    setIsGeneratingAllShots(false); // UI update immediately
  };

  const [generatingAudio, setGeneratingAudio] = useState<string | null>(null); // dialogue index

  // Helper to generate audio for a specific dialogue line
  const handleGenerateDialogueAudio = async (sceneIndex: number, dialogueIndex: number, text: string, characterName: string) => {
    const key = `${sceneIndex}-${dialogueIndex}`;
    setGeneratingAudio(key);

    try {
      // Find Voice ID from config
      // casting = { "Char ID": "voice_id" }
      // We need to map Character Name -> Character ID -> Voice ID
      // This is tricky if we don't have the char ID here. 
      // Ideally ScriptScene.dialogue should store CharID, but it likely only has Name.
      // Let's try to find character by name in assets.
      const character = assets.find(a => a.name === characterName);

      // Handle both old (string) and new (object) casting formats
      const castingEntry = character ? config?.modules?.audio?.casting?.[character.id] : null;

      let voiceId = "alloy";
      let options = { speed: 1.0, stability: 0.5 };

      if (castingEntry) {
        if (typeof castingEntry === 'string') {
          voiceId = castingEntry;
        } else if (typeof castingEntry === 'object') {
          voiceId = castingEntry.voiceId || "alloy";
          options.speed = castingEntry.speed || 1.0;
          options.stability = castingEntry.stability || 0.5;
        }
      }

      const tempUrl = await audioService.generateSpeech(text, voiceId, options);

      if (tempUrl) {
        let finalAudioUrl = tempUrl;

        // Persist to Storage & Assets
        if (user?.uid) {
          try {
            console.log("Uploading dialogue audio to storage...");
            const blobRes = await fetch(tempUrl);
            const blob = await blobRes.blob();

            const timestamp = Date.now();
            const storagePath = `users/${user.uid}/assets/${timestamp}_dialogue_${sceneIndex}_${dialogueIndex}.mp3`;
            finalAudioUrl = await storageService.uploadFile(storagePath, blob);
            console.log("Dialogue audio uploaded:", finalAudioUrl);

            await assetService.saveAsset(user.uid, {
              type: 'audio',
              url: finalAudioUrl,
              name: `Voice: ${characterName} - Scene ${sceneIndex + 1}`,
              prompt: `Voice: ${voiceId} | Text: "${text.slice(0, 30)}..."`,
              metadata: {
                character: characterName,
                voiceId: voiceId,
                projectId: config?.id || null
              }
            });
            console.log("Dialogue asset saved to library");
          } catch (err) {
            console.error("Failed to persist dialogue asset", err);
            // Fallback to tempUrl if upload fails
          }
        }

        let generatedScript: ScriptScene[] = [];
        setScript(prev => {
          generatedScript = [...prev];
          const scene = { ...generatedScript[sceneIndex] };
          const dialogue = [...scene.dialogue];
          dialogue[dialogueIndex] = { ...dialogue[dialogueIndex], audio_url: finalAudioUrl };
          scene.dialogue = dialogue;
          generatedScript[sceneIndex] = scene;

          return generatedScript;
        });

        // Save audio to project Data outside of the setScript pure function
        setTimeout(() => autoSave(generatedScript), 0);
      }

    } catch (e) {
      console.error(e);
      alert("Failed to generate audio");
    } finally {
      setGeneratingAudio(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0f0f13] text-white">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 p-6 pb-0">
        <div>
          <h2 className="text-3xl font-black mb-2 text-white">Production Script</h2>
          <p className="text-gray-400">Review the screenplay and generate production shots.</p>
        </div>

        <div className="flex gap-2">
          {script.length === 0 ? (
            <button
              onClick={handleGenerateScript}
              disabled={isGeneratingScript}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/50 hover:bg-purple-600 hover:text-white transition-all disabled:opacity-50"
            >
              {isGeneratingScript ? <Icon icon={ICONS.spinner} className="animate-spin" size={20} /> : <Icon icon={ICONS.bot} size={20} />}
              <span>{isGeneratingScript ? 'Auto-Generating Script...' : 'Generate Full Script'}</span>
            </button>
          ) : (
            <div className="flex gap-2">
              {/* Re-Generate (Secondary) */}
              <button
                onClick={() => { if (confirm("Regenerate script? Current progress will be lost.")) handleGenerateScript(); }}
                disabled={isGeneratingScript || isGeneratingAllShots}
                className="p-3 rounded-xl bg-[#262626] text-gray-400 hover:text-white transition-all"
                title="Regenerate Script"
              >
                <Icon icon={ICONS.refresh} size={20} />
              </button>

              {/* Auto-Render (Primary) */}
              {!isGeneratingAllShots ? (
                <button
                  onClick={handleGenerateAllShots}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-900/40 transition-all hover:scale-105"
                >
                  <Icon icon={ICONS.image} size={20} />
                  <span>Auto-Render All Shots ({script.filter(s => !s.production_image).length})</span>
                </button>
              ) : (
                <button
                  onClick={stopGeneration}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white transition-all"
                >
                  <Icon icon={ICONS.close} size={20} />
                  <span>Stop Rendering</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* VERSION ACTIONS */}
      {onSaveVersion && (
        <div className="flex justify-end px-6 mb-2">
          <button
            onClick={onSaveVersion}
            className="text-xs flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            <Icon icon={ICONS.save} size={12} /> Save Script Version
          </button>
        </div>
      )}

      {/* VERSION HISTORY */}
      {versions.filter((v: any) => v.phase === 'script').length > 0 && (
        <div className="px-6 mb-6">
          <div className="p-4 bg-[#1e1e1e] border border-[#333] rounded-xl">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Icon icon={ICONS.clock} size={12} /> Script History
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-800">
              {versions.filter((v: any) => v.phase === 'script').map((v: any) => (
                <div key={v.id} className="flex justify-between items-center text-sm p-2 hover:bg-[#262626] rounded-lg group">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-xs font-mono">{v.timestamp?.toDate().toLocaleString()}</span>
                    <span className="text-gray-400 text-xs">
                      {(v.snapshotData.modules?.script || []).length} Scenes
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm("Restore this script version?")) {
                        if (v.snapshotData.modules?.script) {
                          setScript(v.snapshotData.modules.script);
                        }
                      }
                    }}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONTENT STREAM */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-12">
        {script.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-[#262626] rounded-3xl gap-4">
            <Icon icon={ICONS.fileText} size={64} className="opacity-20" />
            <p>Ready to write? Click Generate above.</p>
          </div>
        ) : (
          script.map((scene, i) => (
            <div key={scene.id} className="grid grid-cols-1 lg:grid-cols-5 gap-8 border-b border-[#262626] pb-12 last:border-0">

              {/* LEFT: SCRIPT VERTICAL (3 Cols) - DARK MODE */}
              <div className="lg:col-span-3 bg-[#1e1e1e] text-gray-300 p-8 rounded-xl shadow-xl font-mono text-sm leading-relaxed relative border border-[#333]">
                {/* Slugline */}
                <div className="font-bold underline uppercase mb-6 text-white bg-[#333] inline-block px-2 py-1 rounded">{scene.header}</div>

                {/* Action */}
                <div className="mb-6 text-gray-300">
                  <p>{scene.action}</p>
                </div>

                {/* Dialogue */}
                <div className="space-y-4 mb-6 px-8">
                  {scene.dialogue.map((d, idx) => (
                    <div key={idx} className="text-center group relative p-2 hover:bg-white/5 rounded-lg transition-colors">
                      <div className="font-bold uppercase text-white">{d.character}</div>
                      {d.parenthetical && <div className="text-xs italic text-gray-500">({d.parenthetical})</div>}
                      <div className="text-white mb-2">{d.line}</div>

                      {/* Audio Controls */}
                      <div className="flex justify-center gap-2 opacity-100 transition-opacity">
                        {d.audio_url ? (
                          <button
                            onClick={() => new Audio(d.audio_url!).play()}
                            className="text-xs flex items-center gap-1 text-green-400 bg-green-900/20 px-2 py-1 rounded hover:bg-green-900/40"
                          >
                            <Icon icon={ICONS.volume} size={12} /> Play
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGenerateDialogueAudio(i, idx, d.line, d.character)}
                            disabled={generatingAudio === `${i}-${idx}`}
                            className="text-xs flex items-center gap-1 text-purple-400 bg-purple-900/20 px-2 py-1 rounded hover:bg-purple-900/40 disabled:opacity-50"
                          >
                            {generatingAudio === `${i}-${idx}` ? <Icon icon={ICONS.spinner} className="animate-spin" size={12} /> : <Icon icon={ICONS.mic} size={12} />}
                            Generate Audio
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tech Notes */}
                <div className="mt-8 pt-4 border-t border-[#333] flex gap-4 text-xs font-bold uppercase tracking-wider">
                  <span className="text-red-400 flex items-center gap-1">
                    <Icon icon={ICONS.music || ICONS.volume} size={12} />
                    {scene.sfx || 'NO SFX'}
                  </span>
                  <span className="text-blue-400 flex items-center gap-1">
                    <Icon icon={ICONS.video} size={12} />
                    {scene.camera || 'STATIC'}
                  </span>
                </div>

                {/* Fold Effect (Dark) */}
                <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-[#333] to-[#1e1e1e] drop-shadow-md"></div>
              </div>

              {/* RIGHT: PRODUCTION PANEL (2 Cols) */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                {/* Prompt Card */}
                <div className="bg-[#141414] border border-[#262626] rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase">
                      <Icon icon={ICONS.sparkles} size={12} />
                      <span>Visual Prompt</span>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(scene.visual_prompt || '')}
                      className="text-gray-500 hover:text-white"
                    >
                      <Icon icon={ICONS.copy} size={12} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 font-mono leading-relaxed line-clamp-4 hover:line-clamp-none transition-all">
                    {scene.visual_prompt || "No prompt generated."}
                  </p>
                </div>

                {/* Preview / Action */}
                <div className="flex-1 min-h-[200px] bg-black rounded-xl overflow-hidden relative border border-[#262626] group">
                  {scene.production_image ? (
                    <>
                      <img src={scene.production_image} alt="Shot" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button onClick={() => setPreviewUrl(scene.production_image!)} className="p-3 bg-white/10 rounded-full hover:bg-white text-white hover:text-black transition-all">
                          <Icon icon={ICONS.eye} size={20} />
                        </button>
                        <button
                          onClick={() => handleGenerateShot(scene.id)}
                          className="p-3 bg-purple-600 rounded-full text-white hover:bg-purple-500 transition-all"
                        >
                          <Icon icon={ICONS.refresh} size={20} />
                        </button>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-white uppercase">
                        Final Render
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-600 p-6 text-center">
                      <Icon icon={ICONS.image} size={32} className="opacity-50" />
                      <p className="text-xs">No shot generated for this scene yet.</p>
                      <button
                        onClick={() => handleGenerateShot(scene.id)}
                        disabled={generatingSceneId === scene.id || !scene.visual_prompt}
                        className="px-6 py-2 bg-[#262626] hover:bg-purple-600 hover:text-white transition-all rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generatingSceneId === scene.id ? (
                          <Icon icon={ICONS.spinner} className="animate-spin" size={16} />
                        ) : (
                          <Icon icon={ICONS.video} size={16} />
                        )}
                        <span>{generatingSceneId === scene.id ? 'Rendering...' : 'Generate Shot'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Shot Preview Modal */}
      {previewUrl && <ShotPreviewModal imageUrl={previewUrl} onClose={() => setPreviewUrl(null)} />}

      {/* FOOTER NAV */}
      <div className="flex justify-between items-center mt-12 pt-6 border-t border-[#262626]">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl hover:bg-[#262626] text-gray-400 hover:text-white transition-colors"
        >
          Back to Audio
        </button>
        <button
          disabled={script.length === 0}
          onClick={() => onNext(script)}
          className="px-8 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Finish & Production &rarr;
        </button>
      </div>
    </div>
  );
}
