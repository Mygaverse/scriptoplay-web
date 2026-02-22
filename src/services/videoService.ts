export const videoService = {

  /**
   * Starts a video generation task (Text-to-Video or Image-to-Video)
   * Returns the Generation ID
   */
  /**
   * Starts a video generation task with Smart Routing
   */
  async generateVideo(prompt: string, imageUrl?: string, audioUrl?: string, tags: string[] = [], modelPreference: 'fast' | 'quality' | 'auto' | 'o3' = 'auto', imageEndUrl?: string, duration?: string | number) {
    try {
      // --- SMART ROUTING LOGIC ---
      let selectedModel = 'fal-ai/luma-dream-machine/ray-2'; // Default Base (Ray 2)

      // 0. ABSOLUTE OVERRIDE: If audio is explicitly passed with an image, we MUST use a lip-sync capable model.
      if (audioUrl && imageUrl) {
        selectedModel = 'fal-ai/kling-video/v1.6/pro/image-to-video';
        // Note: Kling 1.6 Pro Image-to-Video handles audio_url for lip sync implicitly, no special endpoint suffix needed.
        console.log("Smart Routing: Forced QUALITY LIP SYNC (Kling 1.6 Pro) due to audioUrl present");
      }
      // 1. USER PREFERENCE OVERRIDE (Only if we aren't forced into Lip Sync)
      else if (modelPreference === 'o3') {
        selectedModel = imageUrl
          ? 'fal-ai/kling-video/o3/standard/image-to-video'
          : 'fal-ai/kling-video/o3/standard/text-to-video';
        console.log("Smart Routing: Forced O3 (Kling 1.6 O3 Standard)");
      } else if (modelPreference === 'fast') {
        selectedModel = imageUrl
          ? 'fal-ai/luma-dream-machine/ray-2/image-to-video'
          : 'fal-ai/luma-dream-machine/ray-2';
        console.log("Smart Routing: Forced FAST (Luma Ray 2)");
      } else if (modelPreference === 'quality') {
        selectedModel = imageUrl
          ? 'fal-ai/kling-video/v1.6/pro/image-to-video'
          : 'fal-ai/kling-video/v1.6/pro/text-to-video';
        console.log("Smart Routing: Forced QUALITY (Kling 1.6 Pro)");
      }
      // 2. AUTO: Character-Heavy
      else if (tags.some(t => ['dialogue', 'character', 'speaking', 'acting'].includes(t.toLowerCase()))) {
        selectedModel = imageUrl
          ? 'fal-ai/kling-video/v1.6/pro/image-to-video'
          : 'fal-ai/kling-video/v1.6/pro/text-to-video';
        console.log("Smart Routing: Auto-Selected QUALITY (Character)");
      }
      // 2. AUTO: Action/Physics (Kling)
      else if (tags.some(t => ['action', 'running', 'fight', 'physics'].includes(t.toLowerCase()))) {
        selectedModel = imageUrl
          ? 'fal-ai/kling-video/v1.6/pro/image-to-video'
          : 'fal-ai/kling-video/v1.6/pro/text-to-video';
        console.log("Smart Routing: Auto-Selected QUALITY (Action/Physics)");
      }
      // 3. AUTO: Environment/Default (Luma -> Upgrade to Kling for now for stability)
      else {
        // Defaulting to Quality for stability until Luma is fully verified again
        selectedModel = imageUrl
          ? 'fal-ai/kling-video/v1.6/pro/image-to-video'
          : 'fal-ai/kling-video/v1.6/pro/text-to-video';
        console.log("Smart Routing: Auto-Selected QUALITY (Stability Default)");
      }

      // --- ORCHESTRATOR CALL ---
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'video',
          model: selectedModel,
          prompt,
          image_url: imageUrl,
          image_end_url: imageEndUrl,
          audio_url: audioUrl,
          duration,
          aspect_ratio: "16:9"
        }),
      });

      if (!response.ok) {
        let errData: any = {};
        const errText = await response.text();
        try {
          errData = JSON.parse(errText);
        } catch (e) {
          errData = { error: errText }; // It's likely an HTML error page or raw string
        }
        console.error("Video Service Error:", response.status, errData);
        throw new Error(errData.error || `Failed to start video generation (${response.status})`);
      }

      const data = await response.json();
      console.log("Video Service Response:", data);

      // Handle Async Response (RequestId)
      if (data.requestId) {
        console.log(`Video Generation Queued (ID: ${data.requestId}, Model: ${data.model}). Polling...`);
        return await this.pollForVideo(data.requestId, data.model);
      }

      if (!data?.url) throw new Error(`Invalid Orchestrator Response: ${JSON.stringify(data)}`);
      return data.url;
    } catch (error) {
      console.error("Video Service Start Error:", error);
      throw error;
    }
  },

  /**
   * Polls the status endpoint until video is ready
   */
  async pollForVideo(requestId: string, modelId?: string) {
    const maxAttempts = 60; // 10s * 60 = 10 mins (Kling is slow)
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, 10000)); // Wait 10s (Reduced noise)

      try {
        const statusParams = await this.checkStatus(requestId, modelId); // This now calls orchestrator status
        console.log(`Video Poll Status (${i + 1}/${maxAttempts}):`, statusParams.status);

        if (statusParams.status === 'completed' && statusParams.url) {
          if (typeof statusParams.url !== 'string') {
            console.error("CRITICAL: Poll URL is not a string:", statusParams.url);
            throw new Error("Invalid URL format received from polling");
          }
          console.log("Video Polling Complete. Returning URL:", statusParams.url);
          return statusParams.url;
        }
        if (statusParams.status === 'failed' || statusParams.status === 'error') {
          throw new Error(statusParams.error || "Video Generation Failed");
        }
      } catch (e) {
        console.warn("Poll failed, retrying...", e);
        // Verify if error is fatal? For now continue unless 500s persist
      }
    }
    throw new Error("Video Generation Timed Out");
  },

  /**
   * Checks the status of a generation
   * Returns full status object: { state: 'completed'|'dreaming'|'failed', assets: { video: 'url' }, ... }
   */
  async checkStatus(requestId: string, modelId?: string) {
    try {
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'status',
          requestId,
          modelId
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Video Service Status Failed:", response.status, errText);
        throw new Error(`Failed to check status: ${response.status} ${errText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Video Service Status Error:", error);
      throw error;
    }
  }

};
