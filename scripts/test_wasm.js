const { FFmpeg } = require('@ffmpeg/ffmpeg');
const { fetchFile } = require('@ffmpeg/util');
const fs = require('fs');
const { execSync } = require('child_process');

async function run() {
  console.log("Generating dummy files...");
  // We can't use native ffmpeg to generate dummy files.
  // We will download sample files or create dummy byte arrays?
  // Let's just create valid tiny files using ffmpeg wasm itself!
  const ff = new FFmpeg();

  ff.on('log', ({ message }) => {
    console.log('[FFmpeg]', message);
  });

  await ff.load();

  // Create a minimal 1-second video (just a color source isn't easily done without encoders)
  // We will just write a filter to generate a 1 second black video and a 1 second sine wave
  console.log("Generating dummy video");
  await ff.exec(['-f', 'lavfi', '-i', 'color=c=black:s=640x360:d=2', '-c:v', 'libx264', 'video.mp4']);

  console.log("Generating dummy voice");
  await ff.exec(['-f', 'lavfi', '-i', 'sine=f=440:d=1', '-c:a', 'libmp3lame', 'audio.mp3']);

  console.log("Generating dummy BGM");
  await ff.exec(['-f', 'lavfi', '-i', 'sine=f=880:d=4', '-c:a', 'libmp3lame', 'bgm.mp3']);

  console.log("Testing Single Audio (Voice Only)...");
  let code1 = await ff.exec([
    '-i', 'video.mp4',
    '-i', 'audio.mp3',
    '-map', '0:v:0',
    '-map', '1:a:0',
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    'muxed_single.mp4'
  ]);
  console.log("Single Audio Code:", code1);

  console.log("Testing Dual Audio (Voice + BGM)...");
  const filterComplex = `[1:a]aformat=sample_rates=44100:channel_layouts=stereo[voice]; [2:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=0.25[bgm]; [voice][bgm]amix=inputs=2:duration=longest[audio_final]`;

  let code2 = await ff.exec([
    '-i', 'video.mp4',
    '-i', 'audio.mp3',
    '-i', 'bgm.mp3',
    '-filter_complex', filterComplex,
    '-map', '0:v:0',
    '-map', '[audio_final]',
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    'muxed_dual.mp4'
  ]);
  console.log("Dual Audio Code:", code2);

  process.exit(0);
}

run().catch(console.error);
