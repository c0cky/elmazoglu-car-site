import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function getChatResponse(message: string, history: any[]) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [...history, { role: 'user', parts: [{ text: message }] }],
    config: {
      systemInstruction: AUTOVIBE_PROMPT
    }
  });

  return response.text;
}

export const AUTOVIBE_PROMPT = `You are AutoVibe AI Support. You help users with:
1. Finding the right car based on their budget and needs.
2. Explaining how the Swap Offer system works.
3. Troubleshooting technical issues on the site.
4. General car maintenance advice.
Be professional, friendly, and concise.`;
