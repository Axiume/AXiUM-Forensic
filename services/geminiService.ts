import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const analyzeImage = async (
  base64Image: string,
  apiKey: string,
  modelName: string
): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key Missing. Configure in Admin Panel.");
  }

  // Remove header if present (e.g., "data:image/jpeg;base64,")
  const cleanBase64 = base64Image.split(',')[1] || base64Image;

  const ai = new GoogleGenAI({ apiKey });

  const systemPrompt = `
    Act as a forensic image expert. Analyze this image. 
    Return a STRICT JSON response with these keys: 
    'is_ai_generated' (boolean), 
    'confidence_score' (number 0-100), 
    'chart_data' (an array of objects with 'name' and 'value' for a pie chart showing probabilities of different artifacts like 'noise', 'lighting', 'anatomy'), 
    and 'detailed_analysis' (a 3-paragraph technical explanation). 
    Do not use markdown formatting, just raw JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName || 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            text: systemPrompt
          },
          {
            inlineData: {
              mimeType: "image/jpeg", // Assuming JPEG for simplicity, GenAI handles most
              data: cleanBase64
            }
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_ai_generated: { type: Type.BOOLEAN },
            confidence_score: { type: Type.NUMBER },
            detailed_analysis: { type: Type.STRING },
            chart_data: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");

    // Clean potential markdown blocks just in case, though responseMimeType should handle it
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Scan Failed:", error);
    throw error;
  }
};