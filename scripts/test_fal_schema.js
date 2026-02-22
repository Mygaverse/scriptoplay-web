const fs = require('fs');
const https = require('https');

const API_KEY = 'd8ed82e3-24b8-4760-8d57-601083b39474:050895d383f9df070c0f2375a93249b8';

async function checkSchema(modelRef) {
  return new Promise((resolve) => {
    https.get(`https://fal.run/${modelRef}/openapi.json`, {
      headers: { 'Authorization': `Key ${API_KEY}` }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: "Parse error" });
        }
      });
    });
  });
}

async function run() {
  const models = [
    'fal-ai/kling-video/v1.6/pro/image-to-video',
    'fal-ai/kling-video/v1.6/pro/image-to-video/lip-sync',
    'fal-ai/kling-video/v1.6/pro/text-to-video',
    'fal-ai/minimax-video/video-01-live'
  ];

  for (const m of models) {
    console.log(`\nChecking schema for ${m}...`);
    const schema = await checkSchema(m);
    if (schema.components && schema.components.schemas) {
      const input = Object.values(schema.components.schemas).find(s => s.title === 'Input' || s.title?.includes('Input'));

      if (input && input.properties) {
        const hasAudio = !!input.properties.audio_url || !!input.properties.audio;
        console.log(`  Valid Endpoint?: YES`);
        console.log(`  Accepts 'audio_url' or 'audio'?: ${hasAudio ? 'YES (' + Object.keys(input.properties).filter(k => k.includes('audio')).join(', ') + ')' : 'NO'}`);
      } else {
        console.log(`  Valid Endpoint?: YES but no clear input properties`);
      }
    } else {
      console.log(`  Valid Endpoint?: NO or Schema not found`);
    }
  }
}

run();
