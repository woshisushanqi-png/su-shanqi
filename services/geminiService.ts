import { GoogleGenAI, Type, Schema } from "@google/genai";
import { RecognitionResult, SupportedLanguage } from "../types";

const cleanBase64 = (dataUrl: string) => {
  return dataUrl.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
};

const getAI = () => {
    if (!process.env.API_KEY) {
        throw new Error("API Key is missing");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// 1. Identify Sketch (Animal or Daily Object)
export const identifySketch = async (base64Image: string): Promise<Omit<RecognitionResult, 'id' | 'timestamp' | 'sourceImage'>> => {
  const ai = getAI();

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      englishName: { type: Type.STRING, description: "English name of the item." },
      chineseName: { type: Type.STRING, description: "Simplified Chinese name." },
      phonetic: { type: Type.STRING, description: "IPA phonetic transcription of the English word." },
      emoji: { type: Type.STRING, description: "Representative emoji." },
      type: { type: Type.STRING, enum: ["sketch"], description: "Always 'sketch'" },
      simpleSentence: { type: Type.STRING, description: "A simple 3-5 word sentence using the word for a toddler." }
    },
    required: ["englishName", "chineseName", "phonetic", "emoji", "simpleSentence"],
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        { inlineData: { mimeType: "image/png", data: cleanBase64(base64Image) } },
        { text: "Identify this simple sketch. It could be an animal, fruit, vehicle, or daily object. Be generous." },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response");
  return JSON.parse(text);
};

// 2. Identify Photo (Core Object + Sentence)
export const identifyPhoto = async (base64Image: string): Promise<Omit<RecognitionResult, 'id' | 'timestamp' | 'sourceImage'>> => {
  const ai = getAI();

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      englishName: { type: Type.STRING, description: "Main object name in English." },
      chineseName: { type: Type.STRING, description: "Main object name in Chinese." },
      phonetic: { type: Type.STRING, description: "IPA phonetic transcription." },
      emoji: { type: Type.STRING, description: "Emoji." },
      type: { type: Type.STRING, enum: ["photo"], description: "Always 'photo'" },
      simpleSentence: { type: Type.STRING, description: "A simple English sentence describing the object for a child." }
    },
    required: ["englishName", "chineseName", "phonetic", "emoji", "simpleSentence"],
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: cleanBase64(base64Image) } },
        { text: "Identify the main object in this photo for a child's learning. Ignore background clutter." },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response");
  return JSON.parse(text);
};

// 3. Translation (Text/Image -> Text)
export const translateContent = async (
    textInput: string, 
    targetLang: SupportedLanguage,
    imageInput?: string
): Promise<string> => {
    const ai = getAI();
    
    const parts: any[] = [];
    if (imageInput) {
        parts.push({ inlineData: { mimeType: "image/jpeg", data: cleanBase64(imageInput) } });
        parts.push({ text: "First, transcribe any text found in the image. If no text, describe the image briefly." });
    }
    
    let prompt = `Translate the following to ${targetLang}. Return ONLY the translated text.`;
    if (textInput) {
        parts.push({ text: `Input text: "${textInput}". ${prompt}` });
    } else if (imageInput) {
        parts.push({ text: `Then, ${prompt}` });
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts },
    });

    return response.text || "Translation failed.";
};
