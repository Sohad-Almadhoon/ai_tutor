export const subjects = [
  "maths",
  "language",
  "science",
  "history",
  "coding",
  "economics",
];

export const subjectsColors = {
  science: "#E5D0FF",
  maths: "#FFDA6E",
  language: "#BDE7FF",
  coding: "#FFC8E4",
  history: "#FFECC8",
  economics: "#C8FFDF",
};

export const voiceProviders = [
  {
    id: "11labs",
    name: "ElevenLabs",
    description: "Natural, expressive voices with a warm human feel.",
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "Clear, balanced voices for friendly everyday tutoring.",
  },
  {
    id: "deepgram",
    name: "Deepgram",
    description: "Responsive voices designed for real-time conversations.",
  },
] as const;

export const voiceOptions = [
  {
    provider: "11labs",
    id: "2BJW5coyhAzSr8STdHbE",
    name: "Archer",
    description: "Confident and approachable, with a relaxed conversational tone.",
  },
  {
    provider: "11labs",
    id: "c6SfcYrb2t09NHXiT80T",
    name: "Brittney",
    description: "Bright and clear, ideal for upbeat step-by-step lessons.",
  },
  {
    provider: "11labs",
    id: "ZIlrSGI4jZqobxRKprJz",
    name: "Hope",
    description: "Friendly and reassuring, with a gentle teaching presence.",
  },
  {
    provider: "11labs",
    id: "sarah",
    name: "Sarah",
    description: "Warm and articulate, suited to calm explanations.",
  },
  {
    provider: "openai",
    id: "alloy",
    name: "Alloy",
    description: "Neutral, versatile, and easy to follow.",
  },
  {
    provider: "openai",
    id: "echo",
    name: "Echo",
    description: "Smooth and thoughtful, for focused learning sessions.",
  },
  {
    provider: "openai",
    id: "fable",
    name: "Fable",
    description: "Expressive and lively, a natural fit for storytelling.",
  },
  {
    provider: "openai",
    id: "onyx",
    name: "Onyx",
    description: "Steady and grounded, with a confident delivery.",
  },
  {
    provider: "openai",
    id: "nova",
    name: "Nova",
    description: "Upbeat and encouraging, with an energetic sound.",
  },
  {
    provider: "openai",
    id: "shimmer",
    name: "Shimmer",
    description: "Light and gentle, for an approachable tutor.",
  },
  {
    provider: "deepgram",
    id: "asteria",
    name: "Asteria",
    description: "Bright and expressive, with a polished sound.",
  },
  {
    provider: "deepgram",
    id: "luna",
    name: "Luna",
    description: "Soft and friendly, ideal for relaxed explanations.",
  },
  {
    provider: "deepgram",
    id: "stella",
    name: "Stella",
    description: "Clear and upbeat, keeping lessons easy to follow.",
  },
  {
    provider: "deepgram",
    id: "athena",
    name: "Athena",
    description: "Confident and composed, for a focused learning style.",
  },
  {
    provider: "deepgram",
    id: "hera",
    name: "Hera",
    description: "Warm and measured, with a reassuring presence.",
  },
  {
    provider: "deepgram",
    id: "orion",
    name: "Orion",
    description: "Grounded and articulate, suited to detailed topics.",
  },
] as const;

export const companionAvatars = ["🌟", "📚", "🧪", "💻", "🌍", "🧮"] as const;

export const speakingStyles = [
  "Friendly",
  "Calm",
  "Encouraging",
  "Patient",
  "Motivational",
  "Analytical",
  "Playful",
  "Structured",
  "Storytelling",
  "Practical",
] as const;

export const languages = [
  "English",
  "Arabic",
  "Spanish",
  "French",
  "German",
  "Hindi",
] as const;

export const lessonDurations = [10, 15, 20, 30, 45, 60] as const;

export const recentSessions = [
  {
    id: "1",
    subject: "science",
    name: "Neura the Brainy Explorer",
    topic: "Neural Network of the Brain",
    duration: 45,
    color: "#E5D0FF",
  },
  {
    id: "2",
    subject: "maths",
    name: "Countsy the Number Wizard",
    topic: "Derivatives & Integrals",
    duration: 30,
    color: "#FFDA6E",
  },
  {
    id: "3",
    subject: "language",
    name: "Verba the Vocabulary Builder",
    topic: "English Literature",
    duration: 30,
    color: "#BDE7FF",
  },
  {
    id: "4",
    subject: "coding",
    name: "Codey the Logic Hacker",
    topic: "Intro to If-Else Statements",
    duration: 45,
    color: "#FFC8E4",
  },
  {
    id: "5",
    subject: "history",
    name: "Memo, the Memory Keeper",
    topic: "World Wars: Causes & Consequences",
    duration: 15,
    color: "#FFECC8",
  },
  {
    id: "6",
    subject: "economics",
    name: "The Market Maestro",
    topic: "The Basics of Supply & Demand",
    duration: 10,
    color: "#C8FFDF",
  },
];
