import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, voice, speed, provider } = await req.json();

    // ---------------------------------------------------------
    // OPTION A: ELEVENLABS
    // ---------------------------------------------------------
    if (provider === 'elevenlabs' || (voice && voice.length > 10)) {
      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: "Missing ELEVENLABS_API_KEY" }, { status: 401 });
      }

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 }
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(`ElevenLabs Failed: ${err.detail?.message || response.statusText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.byteLength.toString(),
        },
      });
    }

    // ---------------------------------------------------------
    // OPTION B: OPENAI (Default)
    // ---------------------------------------------------------
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 401 });
    }

    // Call OpenAI Audio API
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
        speed: speed || 1.0,
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "OpenAI TTS Failed");
    }

    // Get the audio data as an ArrayBuffer
    const audioBuffer = await response.arrayBuffer();

    // Return as a standard audio response
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });

  } catch (error: any) {
    console.error("Audio Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
