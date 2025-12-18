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

  // Extremely detailed forensic prompt to push the model's scrutiny
  const systemPrompt = `
    You are a world-class Digital Forensic Investigator specializing in AI generation detection and deepfake analysis.
    Your task is to perform a pixel-by-pixel, high-fidelity scan of the provided image to identify if it is synthetic (AI-generated) or authentic.

    CRITICAL ANALYSIS PROTOCOL:
    1. FREQUENCY DOMAIN: Check for GAN/Diffusion signature artifacts in high-frequency noise patterns.
    2. MICRO-TEXTURES: Inspect skin pores, hair follicles, and fabric textures for repeating patterns or unnatural smoothness.
    3. LIGHTING & SHADOWS: Analyze light source directionality. Look for inconsistent specular highlights in eyes or impossible shadow casting.
    4. GEOMETRIC ANOMALIES: Scrutinize background structures, text rendering, and complex anatomical parts (fingers, teeth, ears).
    5. COMPRESSION ARTIFACTS: Differentiate between JPEG double-compression and AI-generated grid misalignments.

    OUTPUT FORMAT:
    You must return a STRICT JSON object. No markdown, no pre-amble.
    Keys:
    - 'is_ai_generated': boolean
    - 'confidence_score': number (0-100)
    - 'chart_data': Array of {name: string, value: number} representing probability of anomalies (e.g., "Noise Inconsistency", "Geometry Error", "Luminance Flaws").
    - 'detailed_analysis': A comprehensive technical report (min 3 paragraphs) detailing the specific forensic evidence found at the pixel level. Use technical terminology.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName || 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: systemPrompt
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
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
                },
                required: ["name", "value"]
              }
            }
          },
          required: ["is_ai_generated", "confidence_score", "detailed_analysis", "chart_data"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI core.");

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText) as AnalysisResult;

  } catch (error: any) {
    console.error("Forensic Analysis Failure:", error);
    throw new Error(error.message || "Failed to establish neural uplink for analysis.");
  }
};