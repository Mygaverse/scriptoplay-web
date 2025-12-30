'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ICONS } from '@/config/icons';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { projectService } from '@/services/projectService';

import { aiService } from '@/services/aiService';

// --- Types ---
interface BlendedIdea {
  title: string;
  desc: string;
}

// --- Configuration Data ---
const GENRES = [
  { id: 'sci-fi', label: 'Sci-Fi', color: 'text-blue-400 border-blue-500/50' },
  { id: 'horror', label: 'Horror', color: 'text-red-400 border-red-500/50' },
  { id: 'comedy', label: 'Comedy', color: 'text-yellow-400 border-yellow-500/50' },
  { id: 'drama', label: 'Drama', color: 'text-purple-400 border-purple-500/50' },
];

const INGREDIENTS = {
  Characters: ['Detective', 'Cyborg', 'Ghost', 'Chef', 'Pilot', 'King'],
  Settings: ['Mars Colony', 'Subway', 'Castle', 'Diner', 'Jungle', 'Lab'],
  Time: ['Future', '1980s', 'Medieval', 'Present Day', 'Ancient Rome'],
  Culture: ['Cyberpunk', 'Noir', 'Steampunk', 'Utopian', 'Dystopian']
};

export default function ScriptBlender() {
  const [genre, setGenre] = useState('sci-fi');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [isBlending, setIsBlending] = useState(false);
  //state for the LIST of results
  const [results, setResults] = useState<BlendedIdea[] | null>(null);

  // Router & Auth
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // State for the blended result
  const [blendedLogline, setBlendedLogline] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  


  // --- Handlers for Ingredients ---
  const addItem = (item: string) => {
    if (selectedItems.length >= 5) return;
    if (!selectedItems.includes(item)) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const removeItem = (item: string) => {
    setSelectedItems(selectedItems.filter((i) => i !== item));
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput && selectedItems.length < 5) {
      addItem(customInput);
      setCustomInput('');
    }
  };

  // --- mOCK DATA for Blending and Generation ---
  const startBlending = () => {
    if (selectedItems.length === 0) return;
    setIsBlending(true);
    setResults(null);
    
    // Simulate AI Generation Time
    setTimeout(() => {
      setIsBlending(false);
      // Mock Results
      setResults([
        { title: "The Neon Saxophone", desc: "In a futuristic Mars Colony (Setting), a retired Cyborg (Character) discovers an ancient saxophone that controls the city's power grid. He must protect it from the corporation that built him." },
        { title: "Rust & Rhythm", desc: "A noir detective story set on Mars, where the rain is acid and the only way to solve the murder is to decode a jazz melody left at the crime scene." },
        { title: "System Override", desc: "A comedy about a Cyborg who tries to become a chef in a high-class Mars restaurant but keeps accidentally hacking the appliances." }
      ]);
    }, 2500);
  };

  // --- AI GENERATION ---
  const handleBlend = async () => {
    setLoading(true);
    setResults(null); // Clear previous results

    // Simulate AI delay
    try {
     // Construct the prompt based on user selection
     const prompt = `
         Act as a professional screenwriter. 
         Generate 3 distinct, compelling movie concepts based on these parameters:
         - Genre: ${selectedGenre || 'Sci-Fi'}
         - Tone: ${genre || 'Dark'}
         - Keywords: ${selectedItems.join(', ') || 'Space, Mystery'}

         CRITICAL: Return ONLY a valid JSON array. Do not include markdown formatting (like \`\`\`json).
         Format:
         [
           { "title": "Catchy Title 1", "desc": "Logline for concept 1..." },
           { "title": "Catchy Title 2", "desc": "Logline for concept 2..." },
           { "title": "Catchy Title 3", "desc": "Logline for concept 3..." }
         ]
       `;

     // 2. Call AI
       let textResponse = await aiService.generate(prompt);

       // 3. Clean the response (Gemini sometimes adds ```json ... ``` wrappers)
       // This regex removes code block syntax if present
       textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

       // 4. Parse JSON
       const parsedResults = JSON.parse(textResponse);

       // 5. Update State
       if (Array.isArray(parsedResults)) {
         setResults(parsedResults);
       } else {
         throw new Error("AI did not return an array");
       }

  } catch (err) {
     console.error("Blend Error:", err);
      alert("Failed to parse AI results. Please try again.");
  } finally {
     setLoading(false);
  }
};

  // --- REAL FIRESTORE CREATION  ---
  const handleCreateProject = async (ideaTitle: string, ideaLogline: string) => {
    if (!user) return;
    setLoading(true); // You might need a way to track loading per-item if you want to be fancy, but global loading is fine for MVP

    try {
      // 2. Create the project using the SPECIFIC idea selected
      const projectId = await projectService.createProject(user.uid, ideaTitle, {
        logline: ideaLogline,
        // Pass other blended tags if available
        modules: {
            themes: [{ id: 't1', name: 'Generated Theme', tag: 'Genre', color: 'from-purple-600 to-blue-600' }]
        }
      });

      // 3. Redirect
      router.push(`/dashboard/workspace?id=${projectId}&source=blender`);
      
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Could not create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-[#0f0f0f] text-white overflow-hidden rounded-2xl border border-[#262626]">
      
      {/* LEFT PANE: The Pantry (Inputs) */}
      <div className="w-full lg:w-1/2 p-8 overflow-y-auto border-r border-[#262626] overflow-hidden scrollbar-thin scrollbar-thumb-zinc-800">
        
        {/* 1. Genre Selector */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">1. Base Liquid (Genre)</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {GENRES.map((g) => (
              <button
                key={g.id}
                onClick={() => setGenre(g.id)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap ${
                  genre === g.id 
                    ? `bg-[#1a1a1a] ${g.color} shadow-[0_0_15px_rgba(0,0,0,0.5)]` 
                    : 'border-[#262626] text-gray-500 hover:border-gray-500'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Ingredients */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">2. Add Ingredients (Max 5)</h3>
             <span className="text-xs text-gray-500">{selectedItems.length}/5 Selected</span>
          </div>

          <div className="space-y-6">
            {Object.entries(INGREDIENTS).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-xs text-gray-500 mb-3 font-medium">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <button
                      key={item}
                      onClick={() => addItem(item)}
                      disabled={selectedItems.includes(item) || selectedItems.length >= 5}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                        selectedItems.includes(item)
                          ? 'bg-purple-900/30 border-purple-500/50 text-purple-300 opacity-50 cursor-default'
                          : 'bg-[#141414] border-[#262626] text-gray-300 hover:border-gray-500 hover:text-white'
                      }`}
                    >
                      {item} +
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Custom Input */}
        <div>
           <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">3. Secret Spice</h3>
           <form onSubmit={handleAddCustom} className="relative">
             <input 
               type="text" 
               value={customInput}
               onChange={(e) => setCustomInput(e.target.value)}
               placeholder="Type your own keyword..." 
               className="w-full bg-[#141414] border border-[#262626] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors pr-12"
             />
             <button 
               type="submit"
               disabled={!customInput || selectedItems.length >= 5}
               className="absolute right-2 top-1.5 bg-[#262626] hover:bg-purple-600 text-white p-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-[#262626]"
             >
               <Icon icon={ICONS.plus} size={16} />
             </button>
           </form>
        </div>
      </div>

      {/* RIGHT PANE: The Blender (Visuals) */}
      <div className="w-full lg:w-1/2 p-8 bg-gradient-to-br from-[#0a0a0a] to-[#111] flex flex-col items-center justify-center relative">
        
        {/* Background Radial Glow */}
        <div className="absolute inset-0 bg-radial-at-c from-purple-900/10 to-transparent pointer-events-none" />

        {/* THE BLENDER JAR */}
        <div className="relative z-10 w-64 h-[400px]">
           {/* Lid */}
           <div className="w-full h-4 bg-[#262626] rounded-t-lg mb-1 mx-auto border border-gray-700" />
           
           {/* Glass Container */}
           <div className="w-full h-full bg-white/5 backdrop-blur-sm border-2 border-white/10 rounded-b-[3rem] relative overflow-hidden flex flex-col items-center justify-end shadow-2xl">
              
              {/* Blender Blade (Visual) */}
              <motion.div 
                animate={isBlending ? { rotate: 360 } : { rotate: 0 }}
                transition={isBlending ? { repeat: Infinity, duration: 0.1, ease: "linear" } : {}}
                className="w-12 h-2 bg-gray-400 rounded-full absolute bottom-6"
              />
              <motion.div 
                animate={isBlending ? { rotate: -360 } : { rotate: 45 }}
                transition={isBlending ? { repeat: Infinity, duration: 0.1, ease: "linear" } : {}}
                className="w-12 h-2 bg-gray-400 rounded-full absolute bottom-6"
              />

              {/* The Ingredients (Falling Items) */}
              <div className="absolute inset-0 p-8 flex flex-wrap content-end justify-center gap-2 pb-16">
                 <AnimatePresence>
                   {!isBlending && selectedItems.map((item, i) => (
                     <motion.div
                       key={item}
                       initial={{ y: -400, opacity: 0, rotate: Math.random() * 45 }}
                       animate={{ y: 0, opacity: 1, rotate: 0 }}
                       exit={{ scale: 0, opacity: 0 }}
                       transition={{ type: "spring", bounce: 0.4, delay: i * 0.1 }}
                       className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center gap-2"
                     >
                        {item}
                        <button onClick={() => removeItem(item)} className="hover:text-black">×</button>
                     </motion.div>
                   ))}
                 </AnimatePresence>

                 {/* Blending Vortex Effect */}
                 {loading && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1.2, rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-t from-purple-600/50 to-pink-600/50 blur-xl rounded-full"
                    />
                 )}
              </div>
           </div>

           {/* Base */}
           <div className="w-48 h-16 bg-[#1a1a1a] mx-auto mt-1 rounded-t-xl border border-[#333] flex items-center justify-center relative shadow-xl">
              {/* The Main Switch */}
              <button 
                onClick={handleBlend}
                disabled={isBlending || selectedItems.length === 0}
                className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.5)] ${
                   isBlending 
                   ? 'bg-red-500 border-red-700 animate-pulse' 
                   : selectedItems.length > 0 
                     ? 'bg-green-500 border-green-700 hover:bg-green-400 hover:scale-105' 
                     : 'bg-gray-700 border-gray-600 cursor-not-allowed'
                }`}
              >
                <Icon icon={isBlending ? ICONS.refresh : ICONS.sparkles} size={20} className="text-white" />
              </button>
           </div>
        </div>

        

        {/* Results Overlay */}
        <AnimatePresence>
          {results && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 bg-[#0a0a0a]/95 backdrop-blur-md z-20 p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Freshly Blended Ideas</h2>
                <Button variant="ghost" onClick={handleBlend}>
                  <Icon icon={ICONS.refresh} className="mr-2"/> Blend Again
                </Button>
              </div>

              <div className="grid gap-4 overflow-y-auto">
                {results.map((idea, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-5 bg-[#141414] border border-[#262626] rounded-xl hover:border-purple-500/50 group transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">{idea.title}</h3>
                       <Badge variant="default">Match 95%</Badge>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{idea.desc}</p>
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                       <Button 
                        size="sm"
                        className='cursor-pointer'
                        onClick={() => handleCreateProject(idea.title, idea.desc)}
                        isLoading={loading}
                       >
                          Open in Workspace <Icon icon={ICONS.arrowRight} className="ml-2"/>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
              
            </motion.div>
            
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}