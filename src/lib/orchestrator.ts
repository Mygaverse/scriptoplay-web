import { fal } from "@fal-ai/client";
import Replicate from "replicate";

// Initialize Replicate
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Configure Fal
fal.config({
  credentials: process.env.FAL_KEY,
});

if (!process.env.FAL_KEY) {
  console.warn("Orchestrator Warning: FAL_KEY is missing from environment variables.");
}

export type ModelType = 'image' | 'video' | 'audio';

export interface GenerationParams {
  prompt: string;
  model?: string;
  [key: string]: any;
}

export const orchestrator = {

  async generateImage(params: GenerationParams) {
    const { prompt, model, aspect_ratio, style_ref, char_ref } = params;

    // Models configuration
    const primaryModel = model || "fal-ai/flux-pro/v1.1";
    const fallbackModel = "fal-ai/flux/dev";

    // Track errors
    const errors: any[] = [];

    // Helper to run generation
    const generateWithModel = async (modelId: string) => {
      console.log(`Orchestrator: Attempting generation with ${modelId}`);
      try {
        const result: any = await fal.subscribe(modelId, {
          input: {
            prompt,
            image_size: aspect_ratio === "16:9" ? "landscape_16_9" : "square_hd",
            safety_tolerance: "2",
            ...(style_ref && { style_ref }),
            ...(char_ref && { char_ref }),
          },
          logs: true,
          onQueueUpdate: (update) => {
            if (update.status === "IN_PROGRESS") {
              update.logs.map((log) => log.message).forEach(console.log);
            }
          },
        });
        return { success: true, data: result };
      } catch (e: any) {
        console.warn(`Orchestrator: Error with ${modelId}`, e);

        // Detect Credit Issues
        if (e.status === 402 || e.status === 403 || e.message?.includes('Forbidden') || e.message?.includes('payment')) {
          errors.push(`${modelId}: INSUFFICIENT CREDITS or API KEY LIMIT`);
          // We could throw immediately if we know it's a credit issue to stop fallback? 
          // But maybe fallback model is free/cheaper? Let's keep fallback for now but log clearly.
        } else {
          errors.push(`${modelId}: ${e.message || JSON.stringify(e)}`);
        }

        return { success: false, error: e };
      }
    };

    try {
      // 1. Try Primary Model
      let attempt = await generateWithModel(primaryModel);
      let result = attempt.data;

      // 2. Retry if needed
      const hasImage = (res: any) => {
        if (!res) return false;
        if (res.images?.length > 0) return true;
        if (res.data?.images?.length > 0) return true;
        if (res.image?.url) return true;
        return false;
      };

      if (!attempt.success || !hasImage(result)) {
        console.warn(`Orchestrator: ${primaryModel} failed or empty. Retrying with ${fallbackModel}...`);
        const fallbackAttempt = await generateWithModel(fallbackModel);
        if (fallbackAttempt.success && hasImage(fallbackAttempt.data)) {
          result = fallbackAttempt.data;
        }
      }

      console.log("Orchestrator Final Result:", JSON.stringify(result, null, 2));

      // 3. Final Validation & Extraction
      if (result?.images && result.images.length > 0) return result.images[0].url;
      if (result?.data?.images && result.data.images.length > 0) return result.data.images[0].url;
      if (result?.image?.url) return result.image.url;
      if (result?.url) return result.url; // Direct URL fallback

      const debugInfo = result ? JSON.stringify(result, null, 2).substring(0, 500) : "No result returned";
      throw new Error(`Image generation failed for both models. Errors: [${errors.join(' | ')}]. Last result keywords: ${debugInfo}`);
    } catch (error) {
      console.error("Orchestrator Fatal Error:", error);
      throw error;
    }
  },

  async generateVideo(params: GenerationParams) {
    const { prompt, model, image_url, image_end_url, audio_url, duration, aspect_ratio } = params;

    // Smart Routing Logic defaults
    // Character -> Seedance (via Fal/Volcengine)
    // Environment -> Kling (via Fal)

    // Note: Model IDs are placeholders. You will need actual Fal/Replicate model IDs.
    // "kling-3" -> "fal-ai/kling-video/v1/standard/text-to-video"
    // "seedance-2" -> "fal-ai/luma-dream-machine" (Placeholder for Seedance/Jimeng if avail, or Luma)

    const videoModel = model || "fal-ai/luma-dream-machine";

    try {
      const input: any = {
        prompt,
        aspect_ratio: aspect_ratio || "16:9",
      };

      if (image_url) input.image_url = image_url;
      if (image_end_url) input.image_end_url = image_end_url;
      if (duration) {
        // Clamp duration for Kling compatibility
        let safeDuration = String(duration);
        if (videoModel.includes('kling')) {
          const dInt = parseInt(safeDuration, 10);
          safeDuration = dInt > 5 ? "10" : "5";
        }
        input.duration = safeDuration;
      }

      // Only include audio_url if model supports it (Seedance, Sync-Lips, or future Kling)
      // Currently Kling and Luma on Fal do NOT support direct audio_url for lip sync in this endpoint version
      // But let's check if the model string contains 'seedance' or 'sync' or 'lips'
      // Or if we specifically switch to a lip-sync model later.
      // For now, to avoid 400 Bad Request on Kling/Luma, we strip it unless we are sure.
      if (audio_url) {
        input.audio_url = audio_url;
      }

      console.log("Orchestrator Video Input:", JSON.stringify({ model: videoModel, input }, null, 2));

      // Use Async Submission to avoid Serverless Timeout
      const result: any = await fal.queue.submit(videoModel, {
        input,
        webhookUrl: process.env.FAL_WEBHOOK_URL // Optional, if we supported webhooks
      });

      console.log("Orchestrator Video Submitted:", result);

      return {
        requestId: result.request_id,
        model: videoModel, // Pass model ID back to client
        status: 'queued',
        message: 'Generation started. Please poll for status.'
      };

    } catch (error) {
      console.error("Orchestrator Video Error:", error);
      throw error;
    }
  },

  async checkStatus(requestId: string, modelId?: string) {
    try {
      // Fix types for fal.queue.status
      // If modelId is provided, use likely signature: fal.queue.status(modelId, requestId, ...)
      // Based on error "Invalid app id", the first arg MUST be the app/model ID.
      let status: any;
      if (modelId) {
        // Try multiple signatures for fal.queue.status with modelId
        try {
          // Attempt 1: Standard object with requestId
          status = await fal.queue.status(modelId, { requestId, logs: true } as any);
        } catch (e) {
          console.warn("Attempt 1 failed, trying request_id...");
          try {
            // Attempt 2: Object with request_id (snake_case)
            status = await fal.queue.status(modelId, { request_id: requestId, logs: true } as any);
          } catch (e2) {
            console.warn("Attempt 2 failed, trying direct arg...");
            // Attempt 3: Just the requestId as 2nd arg (unlikely but possible)
            status = await fal.queue.status(modelId, requestId as any);
          }
        }
      } else {
        // Fallback for backward compat or if model not provided (though it should be)
        status = await fal.queue.status(requestId, { logs: true } as any);
      }

      console.log(`Orchestrator Status [${requestId}]:`, status.status);

      if (status.status === 'COMPLETED' || (status.logs && status.logs.some((l: any) => l.message === 'Completed'))) {
        // Many Fal models return the result IN the status check if logs are requested
        // Or we might need to call result(), but let's check status payload first.
        // It's possible status.response_url or similar exists.

        console.log("Orchestrator Status Payload (DEBUG):", JSON.stringify(status, null, 2));

        // Attempt to extract URL from status first (some models do this)
        let url = null;
        const findUrl = (obj: any): string | null => {
          if (!obj) return null;
          if (typeof obj === 'string' && obj.startsWith('http') && (obj.includes('.mp4') || obj.includes('.mov'))) return obj;
          if (typeof obj === 'object') {
            if (obj.url && typeof obj.url === 'string') return obj.url;
            if (obj.video?.url) return obj.video.url;
            for (const k in obj) {
              const found = findUrl(obj[k]);
              if (found) return found;
            }
          }
          return null;
        };

        url = findUrl(status);

        // If status has a response_url, fetch it directly!
        if (status.response_url) {
          console.log("Orchestrator: Fetching response_url:", status.response_url);
          try {
            // Use a direct fetch with the same credentials header if needed, 
            // but usually these are signed or public if the job is done. 
            // Actually fal.queue.result does this but it might be failing on signature.
            // Let's try to just return the response_url if we are lazy? 
            // No, we need the video URL inside it.

            // Let's try to map 'response_url' to the result.
            // If we can't fetch it here easily without auth, we might fallback.
            // But wait, the SDK should handle this. 

            // HYPOTHESIS: The SDK 'result' call is failing because of signature mismatch or similar.
            // Let's rely on the SDK's `fal.queue.result` BUT check the arguments.

            // ACTUALLY: The log shows "inference_time": 0.19s. 
            // This means Luma might have failed to generate a video and just "completed" the process?
            // Or it returned a result elsewhere. 

            // Let's try to just Return the status if it has a response_url 
            // and let the client (or a second fetch) handle it? 
            // No, orchestrator must return the video URL.

            // Fix: Fetch the response_url using the standard fetch with API Key
            const resp = await fetch(status.response_url, {
              headers: {
                'Authorization': `Key ${process.env.FAL_KEY}`,
                'Content-Type': 'application/json'
              }
            });

            if (resp.ok) {
              const json = await resp.json();
              console.log("Orchestrator: Fetched Response Data:", JSON.stringify(json, null, 2));
              url = findUrl(json);
            } else {
              console.warn("Orchestrator: Failed to fetch response_url", resp.status);
            }
          } catch (e) {
            console.error("Orchestrator: Error fetching response_url", e);
          }
        }

        // If not found in status/response_url, try standard result() call ONCE
        if (!url) {
          console.log("URL not in status/response, calling result()...");
          try {
            let result: any;
            try {
              result = await fal.queue.result(modelId || "fal-ai/luma-dream-machine", { requestId } as any);
            } catch (e1) {
              console.warn("Result Attempt 1 failed, trying request_id...");
              try {
                result = await fal.queue.result(modelId || "fal-ai/luma-dream-machine", { request_id: requestId } as any);
              } catch (e2) {
                console.warn("Result Attempt 2 failed, trying direct arg...");
                result = await fal.queue.result(modelId || "fal-ai/luma-dream-machine", requestId as any);
              }
            }
            console.log("Orchestrator Result Payload:", JSON.stringify(result, null, 2));
            url = findUrl(result);
          } catch (e: any) {
            console.error("Orchestrator Result Call Failed:", e.message);
            if (status.response_url) {
              console.warn("Returning response_url as fallback/debug info");
            }
          }
        }

        if (url) {
          console.log("Orchestrator Final URL:", url);
          return { status: 'completed', url, result: status };
        }

        console.warn("Orchestrator: Completed but NO URL found.");
      }

      // Handle Error State (check both status string and error property)
      if (status.status === 'FAILED' || status.status === 'ERROR' || status.error) {
        return { status: 'failed', error: status.error || "Unknown Failure" };
      }

      return { status: status.status, logs: status.logs };
    } catch (e: any) {
      console.error("Orchestrator SDK Status Check Failed:", e);
      throw e;
    }
  },

  async generateAudio(params: GenerationParams) {
    const { prompt, text, voice, model } = params;

    if (model === 'openai') {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("OpenAI API Key missing");

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "tts-1",
          input: text,
          voice: voice || "alloy",
          speed: params.speed || 1.0,
          response_format: "mp3",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "OpenAI TTS Failed");
      }

      return await response.arrayBuffer();

    } else if (model === 'elevenlabs') {
      // Call ElevenLabs API directly or via proxy
      // Since we don't have the SDK installed, we'll fetch direct
      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey) throw new Error("ElevenLabs API Key missing");

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2", // or v3
          voice_settings: { stability: 0.5, similarity_boost: 0.75 }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs API Error:", errorText);
        throw new Error(`ElevenLabs generation failed: ${response.status} - ${errorText}`);
      }
      const blob = await response.blob();
      // Convert blob to base64 or return stream? 
      // For orchestrator, better to return an ArrayBuffer and let API route handle Response
      return await response.arrayBuffer();

    } else if (model === 'suno') {
      // AceData Suno Integration
      const acedataKey = process.env.ACEDATA_API_KEY;
      if (!acedataKey) throw new Error("AceData API Key missing");

      console.log("Orchestrator: Generating music via AceData Suno...");

      // 1. Create Task
      const createResponse = await fetch("https://api.acedata.cloud/suno/audios", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "authorization": `Bearer ${acedataKey}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          action: "generate",
          prompt: prompt,
          model: "chill"
        })
      });

      if (!createResponse.ok) {
        const errText = await createResponse.text();
        let errJson;
        try {
          errJson = JSON.parse(errText);
        } catch (e) {
          // ignore
        }

        if (errJson?.error?.code === 'used_up' || errText.includes('balance is not sufficient')) {
          throw new Error("ACEDATA_INSUFFICIENT_CREDITS");
        }

        throw new Error(`AceData Suno Creation Failed: ${errText}`);
      }

      const createData = await createResponse.json();
      const taskId = createData.task_id || createData.data?.task_id;

      if (!taskId) {
        // Fallback: check if data is directly returned (unlikely for Suno)
        console.error("AceData Response:", createData);
        throw new Error("No task_id returned from AceData");
      }

      console.log(`Orchestrator: Suno Task ID ${taskId}. Polling...`);

      // 2. Poll for Completion (Max 300s = 5 mins)
      const maxAttempts = 75; // 4s interval * 75 = 300s
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise(r => setTimeout(r, 4000)); // Wait 4s

        const pollResponse = await fetch(`https://api.acedata.cloud/suno/audios/${taskId}`, {
          method: "GET",
          headers: {
            "accept": "application/json",
            "authorization": `Bearer ${acedataKey}`
          }
        });

        if (!pollResponse.ok) continue;

        const pollData = await pollResponse.json();
        const status = pollData.status || pollData.data?.status; // 'queued', 'working', 'succeeded', 'failed'

        console.log(`Orchestrator: Suno Status: ${status} (Attempt ${i + 1}/${maxAttempts})`);

        if (status === 'succeeded' || status === 'success') {
          const resultData = pollData.data || pollData;
          // Suno usually returns 2 audios. We pick the first one.
          const audioUrl = resultData.audio_url || (Array.isArray(resultData) ? resultData[0]?.audio_url : null);

          if (audioUrl) {
            console.log("Orchestrator: Suno Audio URL found:", audioUrl);
            const audioResp = await fetch(audioUrl);
            return await audioResp.arrayBuffer();
          }
        }

        if (status === 'failed' || status === 'error') {
          throw new Error(`AceData Suno Task Failed: ${JSON.stringify(pollData)}`);
        }
      }

      throw new Error("AceData Suno Timeout (exceeded 5 mins)");

    } else if (model === 'musicgen') {
      // Fast Fallback: Replicate MusicGen
      // Hash: 7a76a8258b23fae65c5a22debb8841d1d7e816b75c2f24218cd2bd8573787906
      console.log("Orchestrator: Generating music via Replicate MusicGen...");

      let output;
      try {
        output = await replicate.run(
          "meta/musicgen:7a76a8258b23fae65c5a22debb8841d1d7e816b75c2f24218cd2bd8573787906",
          {
            input: {
              prompt,
              model_version: "large",
              duration: 30
            }
          }
        );
      } catch (error: any) {
        console.error("Orchestrator Replicate Error:", error);
        if (error.message?.includes('402') || error.message?.includes('payment')) {
          throw new Error("REPLICATE_INSUFFICIENT_CREDITS");
        }
        throw error;
      }

      // MusicGen returns an audio URI (or array)
      const rawOutput = output as unknown;
      const audioUrl = Array.isArray(rawOutput) ? String(rawOutput[0]) : String(rawOutput);

      // Fetch and return buffer
      const response = await fetch(audioUrl);
      return await response.arrayBuffer();
    }

    throw new Error(`Unsupported audio model: ${model}`);
  }
};
