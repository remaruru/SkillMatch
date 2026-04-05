import { GoogleGenerativeAI, Schema, Type } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const extractSkillsFromText = async (resumeText: string): Promise<string[]> => {
    if (!genAI) {
        console.warn('GEMINI_API_KEY is not set. Skipping real LLM extraction.');
        return [];
    }

    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.STRING
                },
                description: "List of exact technical skills found in the resume"
            }
        }
    });

    const prompt = `You are a technical recruiter AI. Extract a list of specialized technical skills, programming languages, and industry-standard tools from the following resume text. Output ONLY a clean JSON array of strings, normalizing similar terms (e.g., 'React.js' -> 'React'). Include only hard technical skills. Do not include soft skills like "Communication" or "Teamwork".\n\nRESUME TEXT:\n${resumeText}`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const skills = JSON.parse(responseText || '[]');
        return Array.isArray(skills) ? skills : [];
    } catch (error) {
        console.error('LLM Extraction Error:', error);
        throw new Error('Failed to extract skills using AI.');
    }
};
