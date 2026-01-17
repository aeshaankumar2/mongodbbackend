import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `Return ONLY valid JSON with this exact schema:
{
  "redditUrl": "string",
  "youtubeUrl": "string",
  "instagramUrl": "string",
  "linkedinUrl": "string"
}

Rules:
- Use fully qualified URLs
- Prefer official or most widely recognized accounts
- No markdown, no explanations, JSON only`;

export async function resolveSources(query) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing in environment');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `${SYSTEM_PROMPT}\nEntity: ${query}`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 256,
    },
  });

  const response = await result.response;
  const raw = response.text();

  if (!raw) {
    throw new Error('Gemini returned empty response');
  }

  // Parse JSON, handling cases where Gemini wraps it with extra text
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
      throw new Error(`Gemini did not return JSON. Raw: ${raw.slice(0, 300)}`);
    }
    data = JSON.parse(raw.slice(start, end + 1));
  }

  return {
    redditUrl: data.redditUrl || '',
    youtubeUrl: data.youtubeUrl || '',
    instagramUrl: data.instagramUrl || '',
    linkedinUrl: data.linkedinUrl || '',
  };
}
