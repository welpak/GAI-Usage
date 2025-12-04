import { GoogleGenAI } from "@google/genai";

export const checkModelLatency = async (modelId: string): Promise<number> => {
  // Initialize on every call to ensure we pick up the latest selected key from process.env
  // which might change after the user interacts with the key selection dialog.
  const apiKey = process.env.API_KEY || '';
  
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });

  const start = performance.now();
  try {
    // Minimal token request to gauge latency
    await ai.models.generateContent({
      model: modelId,
      contents: "ping", 
      config: {
        maxOutputTokens: 1,
      }
    });
    const end = performance.now();
    return end - start;
  } catch (error: any) {
    // Handle specific error cases for better UI feedback
    if (error.message?.includes('429') || error.status === 429) {
      throw new Error("QUOTA_EXCEEDED");
    }
    console.error(`Error checking latency for ${modelId}:`, error);
    throw error;
  }
};