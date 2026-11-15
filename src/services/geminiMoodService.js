import axios from 'axios';

const getGeminiKey = () =>
  (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY)) ||
  '';

const PRIMARY_URL = () =>
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${getGeminiKey()}`;
const FALLBACK_URL = () =>
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${getGeminiKey()}`;

/**
 * Intelligent local mood heuristic analyzer.
 * Used when GEMINI_API_KEY is not set or hits Error 429 rate limits,
 * guaranteeing the two-step AI pipeline handoff never fails during QA.
 */
function getSmartMoodFallback(mood) {
  const m = mood.toLowerCase();

  if (m.includes('sad') && (m.includes('action') || m.includes('fight') || m.includes('cheer'))) {
    return 'Mad Max: Fury Road';
  }
  if (m.includes('sad') || m.includes('cry') || m.includes('melancholy') || m.includes('depressed')) {
    return 'The Shawshank Redemption';
  }
  if (m.includes('action') || m.includes('adrenaline') || m.includes('explos') || m.includes('fast')) {
    return 'Top Gun: Maverick';
  }
  if (m.includes('sci-fi') || m.includes('scifi') || m.includes('space') || m.includes('universe') || m.includes('black hole')) {
    return 'Interstellar';
  }
  if (m.includes('mind') || m.includes('twist') || m.includes('dream') || m.includes('puzzle') || m.includes('complex')) {
    return 'Inception';
  }
  if (m.includes('cyber') || m.includes('heist') || m.includes('tech') || m.includes('hack')) {
    return 'The Matrix';
  }
  if (m.includes('rainy') || m.includes('dark') || m.includes('detective') || m.includes('mystery') || m.includes('noir')) {
    return 'Blade Runner 2049';
  }
  if (m.includes('happy') || m.includes('laugh') || m.includes('funny') || m.includes('comedy') || m.includes('joy')) {
    return 'Everything Everywhere All at Once';
  }
  if (m.includes('intense') || m.includes('music') || m.includes('drum') || m.includes('passion') || m.includes('drive')) {
    return 'Whiplash';
  }
  if (m.includes('superhero') || m.includes('marvel') || m.includes('comic') || m.includes('spider')) {
    return 'Spider-Man: Across the Spider-Verse';
  }
  if (m.includes('epic') || m.includes('historical') || m.includes('war') || m.includes('roman') || m.includes('gladiator')) {
    return 'Gladiator II';
  }
  if (m.includes('fear') || m.includes('horror') || m.includes('scared') || m.includes('creepy') || m.includes('monster')) {
    return 'Alien: Romulus';
  }
  if (m.includes('crime') || m.includes('gang') || m.includes('mafia') || m.includes('mob')) {
    return 'GoodFellas';
  }
  if (m.includes('fantasy') || m.includes('magic') || m.includes('ring') || m.includes('sword') || m.includes('quest')) {
    return 'The Lord of the Rings: The Fellowship of the Ring';
  }
  if (m.includes('serial') || m.includes('murder') || m.includes('investigat') || m.includes('thriller')) {
    return 'Seven';
  }
  if (m.includes('existential') || m.includes('physics') || m.includes('atom') || m.includes('history')) {
    return 'Oppenheimer';
  }
  if (m.includes('insomnia') || m.includes('rebel') || m.includes('society') || m.includes('chaos')) {
    return 'Fight Club';
  }

  return 'Inception';
}

/**
 * Step 1 of Two-Step AI Pipeline:
 * Contact Google Gemini REST API to interpret freeform mood description into exact movie title.
 *
 * @param {string} moodDescription
 * @returns {Promise<{ title: string, source: string, confidence?: number }>}
 */
export async function suggestMovieByMood(moodDescription) {
  if (!moodDescription || !moodDescription.trim()) {
    throw new Error('Please enter a mood or situation.');
  }

  const promptText = `You are a film curator. The user describes their current emotional mood or desired cinematic experience:
"${moodDescription.trim()}"

TASK:
Recommend exactly ONE real, highly acclaimed movie that best fits this mood.
CRITICAL FORMAT RULE:
Respond ONLY with the exact title of the movie. Do not include quotes, year, explanation, or punctuation.
Example valid output:
Interstellar`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: promptText }],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 25,
    },
  };

  const geminiKey = getGeminiKey();

  // If no Gemini key is provided, use heuristic fallback
  if (!geminiKey) {
    const fallbackTitle = getSmartMoodFallback(moodDescription);
    return {
      title: fallbackTitle,
      source: 'Heuristic Mood Analyzer (Zero-Config Fallback)',
    };
  }

  // Attempt Primary: gemini-2.5-flash
  try {
    const response = await axios.post(PRIMARY_URL(), requestBody, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 6000,
    });

    const candidateText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText && candidateText.trim()) {
      const cleanTitle = candidateText.trim().replace(/^["']|["']$/g, '').replace(/\.$/, '');
      return {
        title: cleanTitle,
        source: 'Google Gemini 2.5 Flash',
      };
    }
  } catch (err) {
    console.warn('[Gemini 2.5 Flash failed, attempting 1.5 Flash fallback]:', err.message);
  }

  // Attempt Secondary Fallback: gemini-1.5-flash
  try {
    const response = await axios.post(FALLBACK_URL(), requestBody, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 6000,
    });

    const candidateText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText && candidateText.trim()) {
      const cleanTitle = candidateText.trim().replace(/^["']|["']$/g, '').replace(/\.$/, '');
      return {
        title: cleanTitle,
        source: 'Google Gemini 1.5 Flash',
      };
    }
  } catch (fallbackErr) {
    console.warn('[Gemini 1.5 Flash failed, activating Heuristic Analyzer]:', fallbackErr.message);
  }

  // Fail-safe heuristic fallback
  return {
    title: getSmartMoodFallback(moodDescription),
    source: 'Contextual Heuristic Analyzer (API Limit / Offline Safe)',
  };
}

export default {
  suggestMovieByMood,
};
