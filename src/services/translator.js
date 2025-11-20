import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY, MODELS_PRIORITY } from '../config.js';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function translateBatch(paragraphs, lang) {
    const textBlob = JSON.stringify(paragraphs);
    const prompt = `
        Translate these ${paragraphs.length} paragraphs of a novel into ${lang}.
        Maintain tone and flow. Return ONLY a JSON array of strings.
        Input: ${textBlob}
    `;

    for (const modelName of MODELS_PRIORITY) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(text);
        } catch (e) {
            console.warn(`⚠️ ${modelName} failed, retrying...`);
        }
    }
    // Fallback if all fail: return original
    return paragraphs;
}
