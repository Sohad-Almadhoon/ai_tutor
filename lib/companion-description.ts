const teachingStyles = [
  {
    keywords: ["patient", "supportive"],
    label: "patient",
    behavior: "takes time to explain ideas step by step",
  },
  {
    keywords: ["friendly", "encouraging", "warm"],
    label: "friendly",
    behavior: "makes questions welcome and helps learners build confidence",
  },
  {
    keywords: ["analytical", "logical"],
    label: "analytical",
    behavior: "breaks complex ideas into clear, logical steps",
  },
  {
    keywords: ["playful", "fun", "humorous"],
    label: "playful",
    behavior: "uses fun examples to make new ideas memorable",
  },
  {
    keywords: ["formal", "structured"],
    label: "structured",
    behavior: "organizes each explanation into clear, focused steps",
  },
  {
    keywords: ["storytelling", "story"],
    label: "imaginative",
    behavior: "turns new topics into memorable stories and examples",
  },
  {
    keywords: ["energetic", "enthusiastic", "motivational"],
    label: "energetic",
    behavior: "keeps lessons lively and celebrates progress",
  },
  {
    keywords: ["practical", "hands-on"],
    label: "practical",
    behavior: "connects new ideas to useful, real-world examples",
  },
  {
    keywords: ["calm", "gentle"],
    label: "calm",
    behavior: "creates a relaxed space to learn at a comfortable pace",
  },
  {
    keywords: ["concise", "brief"],
    label: "concise",
    behavior: "focuses on bite-sized explanations and key takeaways",
  },
];

export function createCompanionDescription(
  name: string,
  speakingStyle: string
) {
  const normalizedStyle = speakingStyle.trim().toLowerCase();
  const matchedStyles = teachingStyles.filter((style) =>
    style.keywords.some((keyword) => normalizedStyle.includes(keyword))
  );

  if (matchedStyles.length > 0) {
    const labels = matchedStyles.map((style) => style.label);
    const behaviors = matchedStyles.map((style) => style.behavior);
    const styleDescription =
      labels.length === 1
        ? labels[0]
        : `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}`;
    const behaviorDescription =
      behaviors.length === 1
        ? behaviors[0]
        : `${behaviors.slice(0, -1).join(", ")} and ${behaviors.at(-1)}`;

    return `${name} is a ${styleDescription} tutor who ${behaviorDescription}.`;
  }

  const fallbackStyle = speakingStyle.trim().replace(/[.!?]+$/, "");
  return `${name} is an AI tutor with a ${fallbackStyle} teaching style who makes learning clear and engaging.`;
}
