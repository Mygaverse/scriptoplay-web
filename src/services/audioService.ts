// ElevenLabs Pre-made Voices
const VOICES = [
  // OpenAI Voices
  { id: 'alloy', name: 'Alloy', gender: 'Neutral', tags: ['Versatile', 'Clear'], provider: 'openai' },
  { id: 'echo', name: 'Echo', gender: 'Male', tags: ['Warm', 'Friendly'], provider: 'openai' },
  { id: 'fable', name: 'Fable', gender: 'Male', tags: ['British', 'Expressive', 'Narrator'], provider: 'openai' },
  { id: 'onyx', name: 'Onyx', gender: 'Male', tags: ['Deep', 'Authoritative', 'Gravelly'], provider: 'openai' },
  { id: 'nova', name: 'Nova', gender: 'Female', tags: ['Energetic', 'Professional'], provider: 'openai' },
  { id: 'shimmer', name: 'Shimmer', gender: 'Female', tags: ['Soft', 'Clear', 'Friendly'], provider: 'openai' },

  // ElevenLabs Voices (Default/Popular)
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'Female', tags: ['American', 'Calm', 'Narration'], provider: 'elevenlabs' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'Female', tags: ['American', 'Strong', 'Confident'], provider: 'elevenlabs' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'Female', tags: ['American', 'Soft', 'Young'], provider: 'elevenlabs' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', gender: 'Female', tags: ['Young', 'Emotional', 'Expressive'], provider: 'elevenlabs' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', gender: 'Male', tags: ['American', 'Deep', 'Narration'], provider: 'elevenlabs' },
  { id: 'VR6AewLTigWg4xSOukaG', name: 'Arnold', gender: 'Male', tags: ['American', 'Gruff', 'Narrative'], provider: 'elevenlabs' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'Male', tags: ['American', 'Deep', 'Mature'], provider: 'elevenlabs' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'Male', tags: ['American', 'Well-rounded', 'Friendly'], provider: 'elevenlabs' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', gender: 'Male', tags: ['American', 'Raspy', 'Trustworthy'], provider: 'elevenlabs' },
  { id: 'flq6f7yk4E4fJM5XTYuZ', name: 'Michael', gender: 'Male', tags: ['Old', 'Authoritative', 'Classic'], provider: 'elevenlabs' },
];

export const audioService = {
  async getVoices() {
    return VOICES;
  },

  async previewVoice(voiceId: string) {
    try {
      // 1. Pick a sample text based on voice? Or just generic.
      const sampleText = "Hello! I am ready to bring your character to life.";

      const voiceObj = VOICES.find(v => v.id === voiceId);
      const provider = voiceObj?.provider || 'openai';

      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sampleText, voice: voiceId, provider }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Audio generation failed: ${response.statusText}`);
      }

      // 2. Play the blob directly
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }

      // Return the audio duration or promise handling
      return new Promise((resolve) => {
        audio.onended = () => {
          resolve(true);
          URL.revokeObjectURL(url); // Cleanup
        };
      });

    } catch (e) {
      console.error("Preview failed:", e);
      return false;
    }
  },

  async generateSpeech(text: string, voiceId: string, options?: { speed?: number, stability?: number }): Promise<string | null> {
    try {
      const voiceObj = VOICES.find(v => v.id === voiceId);
      const provider = voiceObj?.provider || 'openai';

      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'audio',
          model: provider,
          text,
          voice: voiceId,
          ...options
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Audio Service Error:", response.status, errorData);
        throw new Error(errorData.error || `Audio generation failed: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error("Generate Speech failed:", e);
      return null;
    }
  },

  async generateMusic(prompt: string, duration?: number, model: 'suno' | 'musicgen' = 'musicgen'): Promise<string | null> {
    try {
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'audio',
          model, // 'suno' (AceData) or 'musicgen' (Replicate)
          prompt,
          duration
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Music generation failed with status: ${response.status}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (e: any) {
      console.error("Generate Music failed:", e);
      return null;
    }
  }
};
