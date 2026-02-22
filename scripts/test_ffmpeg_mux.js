const { execSync } = require('child_process');

// Generate dummy files
execSync('ffmpeg -y -f lavfi -i color=c=black:s=1280x720:d=5 -c:v libx264 video.mp4');
execSync('ffmpeg -y -f lavfi -i sine=f=440:t=2 -ac 1 -ar 24000 audio.mp3');
execSync('ffmpeg -y -f lavfi -i sine=f=880:t=10 -ac 2 -ar 48000 bgm.mp3');

console.log("Simulating: Both Dialogue and BGM");

const filterComplex = `[1:a]aformat=sample_rates=44100:channel_layouts=stereo[voice]; [2:a]aformat=sample_rates=44100:channel_layouts=stereo,volume=0.25[bgm]; [voice][bgm]amix=inputs=2:duration=longest[audio_final]`;

const argsBoth = [
  'ffmpeg', '-y',
  '-i', 'video.mp4',
  '-i', 'audio.mp3',
  '-i', 'bgm.mp3',
  '-filter_complex', `"${filterComplex}"`,
  '-map', '0:v:0',
  '-map', '[audio_final]',
  '-c:v', 'copy',
  '-c:a', 'aac', '-b:a', '192k',
  '-shortest',
  'muxed.mp4'
];

try {
  execSync(argsBoth.join(' '), { stdio: 'inherit' });
  console.log("Success.");
} catch (e) {
  console.error("Failed.");
}

console.log("\nSimulating: Dialogue Only (Native map bypass)");
// If dialogueInput = 1
const argsDialogue = [
  'ffmpeg', '-y',
  '-i', 'video.mp4',
  '-i', 'audio.mp3',
  '-map', '0:v:0',
  '-map', `1:a:0`, // Native bypass map
  '-c:v', 'copy',
  '-c:a', 'aac', '-b:a', '192k',
  '-shortest',
  'muxed.mp4'
];

try {
  execSync(argsDialogue.join(' '), { stdio: 'inherit' });
  console.log("Success.");
} catch (e) {
  console.error("Failed.");
}
