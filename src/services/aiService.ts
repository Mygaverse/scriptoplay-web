import { getAudienceGuidelines } from '@/utils/cartoonTemplates';

export const aiService = {
  async generate(prompt: string, context?: string) {
    try {
      // Construct a better prompt with context if provided
      const fullPrompt = context
        ? `Context: ${context}\n\nTask: ${prompt}`
        : prompt;

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("AI Service Error:", response.status, errorData);

        // Handle Rate Limits (429)
        if (response.status === 429) {
          throw new Error("RATE_LIMIT");
        }

        throw new Error(errorData.error || `AI Generation Failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.result;
    } catch (error: any) {
      console.error("AI Generate Error:", error);
      if (error.message === "RATE_LIMIT") throw error; // Propagate for retry
      throw error; // Rethrow to allow caller to handle or retry
    }
  },

  // Helper for structured JSON responses
  async generateStructured(prompt: string, retries = 5) { // Increased retries
    try {
      const jsonPrompt = `${prompt} \n\nCRITICAL: Return ONLY valid JSON. No markdown.`;

      let text = "";
      let attempt = 0;

      while (attempt < retries) {
        try {
          text = await this.generate(jsonPrompt);
          break; // Success
        } catch (e: any) {
          if (e.message === "RATE_LIMIT") {
            attempt++;
            // Exponential Backoff: 1s, 2s, 4s, 8s, 16s...
            const delay = Math.pow(2, attempt - 1) * 1000;
            console.warn(`Rate limit hit (Attempt ${attempt}/${retries}). Retrying in ${delay}ms...`);
            await new Promise(r => setTimeout(r, delay));

            if (attempt >= retries) throw new Error("AI Service is busy (Rate Limit Exceeded). Please wait a moment and try again.");
          } else {
            throw e; // Other errors fatal
          }
        }
      }

      // Clean potential markdown wrappers
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      console.error("AI JSON Parse/Gen Error:", error);
      throw new Error("Failed to generate structured data");
    }
  },

  async generateVisualDescriptions(beats: any[], styleConfig?: { prompt: string; label: string }, genre?: string, vibe?: string, audience?: string) {
    try {
      const audienceGuidelines = getAudienceGuidelines(audience);
      const stylePrompt = styleConfig
        ? `VISUAL STYLE: ${styleConfig.label} (${styleConfig.prompt}). ALL ASSETS MUST MATCH THIS STYLE.`
        : '';

      const prompt = `
        Act as a Cartoon Character Designer and Environment Artist.
        ${stylePrompt}
        GENRE: ${genre || 'General'}
        ATMOSPHERE: ${vibe || 'Default'}
        TARGET AUDIENCE: ${audience || 'General'}
        SAFETY/TONE: ${audienceGuidelines}
        
        Analyze the following Beat Sheet for a cartoon:
        ${JSON.stringify(beats)}

        Based on the actions and events, generate a list of CHARACTER and ENVIRONMENT assets needed.
        
        For Characters:
        - Include Name, Visual Description (appearance, style), Role (Protagonist, Antagonist, Supporting), Tags (array of 1-3 keywords), and a precise Image Prompt.
        - **consistencyLock**: A 1-sentence "Visual Manifesto" that describes the character's immutable traits (Species, Color Hex Codes, Key Accessories). Example: "Orange camel, #FF8C00 fur, blue backpack, flat 2D style."
        - **CRITICAL FOR PROMPT**: request a "Character Sheet" showing the character in multiple poses (Front, Side, 3/4 View) and expressions. Mention "white background", "concept art", "clean lines".
        
        For Environments:
        - Include Name, Visual Description (mood, lighting, key elements), Tags (array of 1-3 keywords), and a precise Image Prompt (cinematic, wide shot).
        - **consistencyLock**: Key architectural or color elements that must remain constant.

        Output JSON array of objects:
        [
          { "type": "Character", "name": "...", "description": "...", "role": "...", "tags": ["..."], "prompt": "...", "consistencyLock": "..." },
          { "type": "Environment", "name": "...", "description": "...", "tags": ["..."], "prompt": "...", "consistencyLock": "..." }
        ]
      `;
      return await this.generateStructured(prompt);
    } catch (error) {
      console.error("Visual Gen Error:", error);
      return [];
    }
  },

  /**
   * Intelligently assigns valid OpenAI voice IDs to characters
   */
  async castVoices(characters: any[], availableVoices: any[], audience?: string) {
    try {
      const audienceGuidelines = getAudienceGuidelines(audience);

      const prompt = `
         Act as a Casting Director.
         Assign the best Voice Actor from the AVAILABLE LIST to each Character.
         
         Target Audience: ${audience}.
         Guidelines: ${audienceGuidelines}

         Characters:
         ${JSON.stringify(characters.map(c => ({ id: c.id, name: c.name, desc: c.desc, role: c.role })))}
 
         AVAILABLE VOICES:
         ${JSON.stringify(availableVoices.map(v => ({ id: v.id, name: v.name, gender: v.gender, tags: v.tags })))}
 
         Rules:
         1. Choose the voice that best matches the character's gender, age vibe, and personality.
         2. Explain your reasoning briefly.
 
         Output JSON array:
         [
           { "characterId": "...", "voiceId": "...", "reason": "..." }
         ]
       `;

      const result = await this.generateStructured(prompt);
      return Array.isArray(result) ? result : [];
    } catch (e) {
      console.error("Casting Error:", e);
      return [];
    }
  },

  /**
   * Generates a Soundtrack Plan based on the Beat Sheet
   */
  /**
   * Generates a Soundtrack Plan based on the Beat Sheet and Format
   */
  async composeSoundtrack(beats: any[], format: 'short' | 'long', audience?: string, styleInstructions?: string, genre?: string, vibe?: string, theme?: string, sfxStyle?: string) {
    try {
      const audienceGuidelines = getAudienceGuidelines(audience);
      const isShort = format === 'short';

      const prompt = `
        Act as a Film/Cartoon Composer.
        Analyze this Beat Sheet and compose a ${isShort ? 'SINGLE cohesive track' : 'multi-track musical score plan (3-5 tracks)'}.
        
        FORMAT: ${isShort ? 'Short (<30s). ONE TRACK ONLY.' : 'Long (>30s). Multiple tracks for different story segments.'}
        Target Audience: ${audience}.
        Audience Vibe: ${audienceGuidelines}
        GENRE: ${genre || 'General'}
        VIBE: ${vibe || 'Appropriate'}
        THEME: ${theme || 'None'}
        SFX/AUDIO STYLE: ${sfxStyle || 'Standard'}
        
        MUSICAL STYLE: ${styleInstructions || 'Cinematic, appropriate for the genre.'}

        Beat Sheet:
        ${JSON.stringify(beats)}

        INSTRUCTIONS:
        ${isShort
          ? '- Create exactly 1 track that captures the overall essence of the story.'
          : '- create 3-5 tracks that correspond to the beginning, middle, and end of the story.'}
        
        For each track, provide:
        - "title": A catchy track title.
        - "vibe": 2-3 adjectives (e.g., Whimsical, Tense).
        - "description": A musical description suitable for a Music AI prompt (instruments, tempo, mood).
        
        Ensure the music reflects the "${vibe}" atmosphere and underscores the theme of "${theme}".

        Output JSON array of objects.
      `;

      return await this.generateStructured(prompt);
    } catch (e) {
      console.error("Composing Error:", e);
      return [];
    }
  }

};