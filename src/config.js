import dotenv from 'dotenv';
dotenv.config();

export const PORT = 3000;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const MODELS_PRIORITY = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-pro"];
