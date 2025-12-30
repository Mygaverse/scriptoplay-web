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

      if (!response.ok) throw new Error('AI Generation Failed');

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error(error);
      return "I'm having trouble connecting to the creative engine right now. Please try again.";
    }
  },

  // Helper for structured JSON responses
  async generateStructured(prompt: string) {
    try {
      const jsonPrompt = `${prompt} \n\nCRITICAL: Return ONLY valid JSON. No markdown.`;
      let text = await this.generate(jsonPrompt);
      
      // Clean potential markdown wrappers
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(text);
    } catch (error) {
      console.error("AI JSON Parse Error:", error);
      throw new Error("Failed to generate structured data");
    }
  }

  
};