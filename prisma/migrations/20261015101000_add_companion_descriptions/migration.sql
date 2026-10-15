ALTER TABLE "Companion"
ADD COLUMN "description" TEXT NOT NULL DEFAULT '';

UPDATE "Companion"
SET "description" = CASE
    WHEN LOWER("speakingStyle") LIKE '%patient%'
      OR LOWER("speakingStyle") LIKE '%supportive%'
      THEN "name" || ' is a patient and supportive tutor who takes time to explain ideas step by step.'
    WHEN LOWER("speakingStyle") LIKE '%friendly%'
      OR LOWER("speakingStyle") LIKE '%encouraging%'
      OR LOWER("speakingStyle") LIKE '%warm%'
      THEN "name" || ' is a friendly and encouraging tutor who makes questions welcome and helps learners build confidence.'
    WHEN LOWER("speakingStyle") LIKE '%analytical%'
      OR LOWER("speakingStyle") LIKE '%logical%'
      THEN "name" || ' is a curious and analytical tutor who breaks complex ideas into clear, logical steps.'
    WHEN LOWER("speakingStyle") LIKE '%playful%'
      OR LOWER("speakingStyle") LIKE '%fun%'
      THEN "name" || ' is a playful and engaging tutor who uses fun examples to make new ideas memorable.'
    WHEN LOWER("speakingStyle") LIKE '%story%'
      THEN "name" || ' is an imaginative, story-driven tutor who turns new topics into memorable stories and examples.'
    WHEN LOWER("speakingStyle") LIKE '%energetic%'
      OR LOWER("speakingStyle") LIKE '%enthusiastic%'
      THEN "name" || ' is an energetic and motivating tutor who keeps lessons lively and celebrates progress.'
    WHEN LOWER("speakingStyle") LIKE '%practical%'
      OR LOWER("speakingStyle") LIKE '%hands-on%'
      THEN "name" || ' is a practical tutor who connects new ideas to useful, real-world examples.'
    WHEN LOWER("speakingStyle") LIKE '%calm%'
      OR LOWER("speakingStyle") LIKE '%gentle%'
      THEN "name" || ' is a calm and reassuring tutor who creates a relaxed space to learn at a comfortable pace.'
    ELSE "name" || ' is an AI tutor with a ' || LOWER("speakingStyle") || ' teaching style who makes learning clear and engaging.'
END
WHERE "description" = '';
