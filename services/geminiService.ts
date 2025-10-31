
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// Assume API_KEY is set in the environment
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    // In a real app, you might not throw but handle this gracefully.
    // For this context, we assume it's always available.
    console.warn("API_KEY is not set. The app will not function correctly.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const MODEL_NAME = 'gemini-2.5-flash';

const systemInstruction = `You are a helpful and friendly AI assistant embedded in a website. Your primary role is to assist users by explaining information about the website, how data is generated, and how different features work. Be clear, concise, and approachable. If you don't know the answer, say so politely. Do not answer questions that are unrelated to the website's functionality or data.`;

export function createChatSession(): Chat {
    const chat = ai.chats.create({
        model: MODEL_NAME,
        config: {
            systemInstruction: systemInstruction,
        },
    });
    return chat;
}

export async function sendMessageToBot(chat: Chat, message: string): Promise<string> {
    try {
        const response: GenerateContentResponse = await chat.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "I'm sorry, I encountered an error and couldn't process your request. Please try again later.";
    }
}
