import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ModelType } from "../types";

// Initialize the client. API_KEY is expected to be in the environment variables.
// Note: In a real client-side app, you might proxy this, but for this demo we assume access.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const createChatSession = (model: string = ModelType.FLASH): Chat => {
  return ai.chats.create({
    model: model,
    config: {
      temperature: 0.9,
      topK: 40,
      topP: 0.95,
      systemInstruction: "You are a helpful, energetic, and slightly witty AI assistant. Keep responses concise and engaging. Use formatting like bolding and lists often.",
    },
  });
};

export const sendMessageStream = async (
  chat: Chat, 
  message: string, 
  onChunk: (text: string) => void
): Promise<string> => {
  let fullText = "";
  try {
    const responseStream = await chat.sendMessageStream({ message });
    
    for await (const chunk of responseStream) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        fullText += c.text;
        onChunk(c.text);
      }
    }
  } catch (error) {
    console.error("Error sending message stream:", error);
    throw error;
  }
  return fullText;
};
