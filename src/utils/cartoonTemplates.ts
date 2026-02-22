export type BeatDefinition = {
  type: string;
  label: string;
  duration: number; // in seconds
  description: string; // Guidance for the AI
};

export type CartoonTemplate = {
  id: string;
  label: string;
  totalDuration: number;
  beats: BeatDefinition[] | any[]; // any[] to accept the BeatCards we were generating
};

export const CARTOON_TEMPLATES: Record<string, CartoonTemplate> = {
  '15s': {
    id: '15s',
    label: 'Micro-Short',
    totalDuration: 15,
    beats: [
      { type: 'Setup', label: 'Setup', duration: 3, description: 'Establish the normal. Quick read.' },
      { type: 'Action', label: 'The Turn', duration: 7, description: 'The gag initiates. Rising action.' },
      { type: 'Punchline', label: 'Punchline', duration: 5, description: 'The result. Hard cut or freeze frame.' },
    ]
  },
  '60s': {
    id: '60s',
    label: 'Story Short',
    totalDuration: 60,
    beats: [
      { type: 'Setup', label: 'Setup', duration: 10, description: 'Who and where?' },
      { type: 'Incident', label: 'Inciting Incident', duration: 10, description: 'The problem appears.' },
      { type: 'Escalation', label: 'Escalation', duration: 25, description: 'Failed attempts, getting worse.' },
      { type: 'Climax', label: 'Climax', duration: 10, description: 'The final big move.' },
      { type: 'Resolution', label: 'Resolution', duration: 5, description: 'The new normal or final joke.' },
    ]
  },
  '3m': {
    id: '3m',
    label: 'Webisode',
    totalDuration: 180,
    beats: [
      { type: 'Status Quo', label: 'Status Quo', duration: 30, description: 'Establish character dynamic.' },
      { type: 'Problem', label: 'Problem', duration: 20, description: 'Disruption or mission.' },
      { type: 'First Attempt', label: 'First Attempt (Fail)', duration: 40, description: 'Try to fix it, goes wrong.' },
      { type: 'Second Attempt', label: 'Second Attempt (Worse)', duration: 40, description: 'Escalation/Complication.' },
      { type: 'Climax', label: 'Climax', duration: 35, description: 'High stakes resolution.' },
      { type: 'Outro', label: 'Outro', duration: 15, description: 'Reset for next episode.' },
    ]
  },
  '5m': {
    id: '5m',
    label: 'Mid-Form',
    totalDuration: 300,
    beats: [
      { type: 'Intro', label: 'Intro/Hook', duration: 30, description: 'Introduction to setting/chars.' },
      { type: 'Incident', label: 'Inciting Incident', duration: 30, description: 'The Conflict begins.' },
      { type: 'Plan', label: 'The Plan', duration: 30, description: 'Characters decide what to do.' },
      { type: 'FunGames', label: 'Fun & Games', duration: 60, description: 'Montage or series of gags.' },
      { type: 'LowPoint', label: 'The Low Point', duration: 30, description: 'All seems lost or difficult.' },
      { type: 'Rally', label: 'The Rally', duration: 30, description: 'They find a way back.' },
      { type: 'Climax', label: 'Climax', duration: 60, description: 'Big finish.' },
      { type: 'Resolution', label: 'Resolution', duration: 30, description: 'Wrap up.' },
    ]
  },
  '11m': {
    id: '11m',
    label: 'Quarter-Hour',
    totalDuration: 660,
    beats: [
      { type: 'Teaser', label: 'Teaser', duration: 60, description: 'Cold Open / Hook.' },
      { type: 'Setup', label: 'Setup', duration: 45, description: 'Status Quo & Theme Stated.' },
      { type: 'Incident', label: 'Inciting Incident', duration: 30, description: 'The Problem arrives.' },
      { type: 'Debate', label: 'Debate', duration: 45, description: 'Resistance or preparation.' },
      { type: 'BreakTwo', label: 'Break Into Two', duration: 30, description: 'Crossing the threshold.' },
      { type: 'FunGames', label: 'Fun & Games', duration: 60, description: 'The promise of the premise.' },
      { type: 'Midpoint', label: 'Midpoint', duration: 60, description: 'The Twist / Stakes raise.' },
      { type: 'BadGuys', label: 'Bad Guys Close In', duration: 60, description: 'Escalating complications.' },
      { type: 'AllLost', label: 'All Hope Is Lost', duration: 45, description: 'The lowest moment.' },
      { type: 'Rally', label: 'The Rally', duration: 45, description: 'The solution is found.' },
      { type: 'Climax', label: 'Climax', duration: 120, description: 'The final confrontation.' },
      { type: 'Epilogue', label: 'Epilogue', duration: 60, description: 'New Status Quo / Tag.' },
    ]
  }
};

export const getCartoonTemplate = (length: string): any => {
  // FAST-TRACK: Micro-Shorts get a minimalist 1-Beat structure
  if (length === "15s" || length === "Micro-Short (15-30s)") {
    return {
      id: '15s',
      label: 'Micro-Short',
      totalDuration: 15,
      beats: [
        {
          id: "1",
          type: "Single Take",
          label: "Single Take", // needed for AI prompt loop
          duration: 15, // needed for AI prompt loop
          description: "Describe the characters and the environment in this single shot. Set the scene and action clearly.", // needed for AI prompt loop
          visual: "Describe the characters and the environment in this single shot. Set the scene and action clearly.",
          camera: { move: "Static", angle: "Wide Analysis" },
          lighting: "",
          audio: "Main Ambience and pertinent FX",
          tags: ["Establishing", "Action"]
        }
      ]
    };
  }

  // STANDARD TEMPLATES
  // Extract the key from the length string, e.g., "Quarter-Hour (11m)" -> "11m"
  const match = length.match(/\((\w+)\)/);
  const key = match ? match[1] : '60s'; // Default to '60s' if no match

  const template = CARTOON_TEMPLATES[key] || CARTOON_TEMPLATES['60s'];

  // The consuming components (like CartoonEditor.tsx) expect the full template object with `.beats`
  // so we return the full template object. BeatSheetPhase will use template.beats to map to BeatCards
  return template;
};

export const getAudienceGuidelines = (audience: string | undefined): string => {
  const safeAudience = (audience || '').toLowerCase();

  if (safeAudience.includes('preschool') || safeAudience.includes('2-5')) {
    return "TONE: Gentle, Educational, Warm. THEMES: Sharing, Learning, Friendship. STRICT SAFETY: No violence, no scary imagery, no complex villains. Conflict must be mild and resolved with kindness.";
  }
  if (safeAudience.includes('bridge') || safeAudience.includes('kids') || safeAudience.includes('6-9')) {
    return "TONE: Fun, Energetic, Slapstick. THEMES: Adventure, School, Family. SAFETY: Cartoon violence only (safe/funny), no blood, no intense peril. clear Good vs Evil.";
  }
  if (safeAudience.includes('tween') || safeAudience.includes('10-13')) {
    return "TONE: Aspirational, Cool, Character-Driven. THEMES: Identity, Complex Friendships, Saving the World. SAFETY: moderate peril allowed, emotional complexity, 'Sass' and attitude are okay.";
  }
  if (safeAudience.includes('adult') || safeAudience.includes('teen') || safeAudience.includes('18+')) {
    return "TONE: Edgy, Satirical, Sophisticated. THEMES: Social Commentary, Dark Humor, Complex Relationships. SAFETY: Mature themes allowed, non-linear storytelling, cynicism.";
  }
  if (safeAudience.includes('corporate') || safeAudience.includes('b2b')) {
    return "TONE: Professional, Clean, Informative. THEMES: Solutions, Innovation, Teamwork. SAFETY: Brand-safe, clear messaging, no distracting humor.";
  }

  return "TONE: General Audience. Balanced humor and heart. Suitable for families.";
};
