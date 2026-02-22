import { NextResponse } from 'next/server';
import { orchestrator } from '@/lib/orchestrator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, model, ...params } = body;

    if (!type) {
      return NextResponse.json({ error: "Missing 'type' parameter" }, { status: 400 });
    }

    let result;

    switch (type) {
      case 'image':
        result = await orchestrator.generateImage({ model, ...params });
        return NextResponse.json({ url: result });

      case 'video':
        result = await orchestrator.generateVideo({ model, ...params });
        // Result is now an object { requestId, status } or similar. Do not wrap in { url }.
        return NextResponse.json(result);

      case 'audio':
        const audioBuffer = await orchestrator.generateAudio({ model, ...params });
        return new NextResponse(audioBuffer, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.byteLength.toString(),
          },
        });

      case 'status':
        if (!params.requestId) return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
        const statusResult = await orchestrator.checkStatus(params.requestId, params.modelId); // Pass modelId if available
        return NextResponse.json(statusResult);

      default:
        return NextResponse.json({ error: `Invalid type: ${type}` }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Orchestrator API Error:", error);
    return NextResponse.json({ error: error.message || "Orchestration failed" }, { status: 500 });
  }
}
