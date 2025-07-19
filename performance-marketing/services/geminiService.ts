import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Campaign } from "../types";

export const getMarketingInsights = async (
    userQuery: string,
    campaignData: Campaign[],
    apiKey: string,
): Promise<string> => {
    if (!navigator.onLine) {
        return Promise.reject(new Error("Cannot get AI insights while offline."));
    }
    if (!apiKey) {
        return Promise.reject(new Error("Gemini API key is missing. Please provide it to use AI features."));
    }
    
    const ai = new GoogleGenAI({ apiKey });

    // Sanitize data for the prompt to include key fields, including new ones
    const promptData = campaignData.map(({ name, platform, spend, conversions, roas, ctr, channel, source, contentType }) => ({
        name,
        platform,
        spend,
        conversions,
        roas,
        ctr,
        channel,
        source,
        contentType
    }));

    const systemInstruction = `You are a world-class performance marketing analyst named 'InsightBot'.
    Your role is to analyze campaign data and provide actionable, data-driven insights.
    - Be concise and clear. Use bullet points or numbered lists for recommendations.
    - Always base your analysis strictly on the provided JSON data. Do not invent data.
    - When comparing campaigns, refer to them by name.
    - Consider all available data points, including channel, source, and content type for deeper analysis.
    - Keep your tone professional and helpful.
    - Format numbers and currency appropriately (e.g., $1,234.56, 4.5x ROAS, 2.34% CTR).
    - Always start your response with a brief, one-sentence summary of your findings.`;

    const contents = `
    Here is the current marketing campaign data in JSON format:
    \`\`\`json
    ${JSON.stringify(promptData, null, 2)}
    \`\`\`

    Based on this data, please answer the following question: "${userQuery}"
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.5,
                topP: 0.95,
                topK: 64,
            },
        });
        
        return response.text;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            if (error.message.includes('API key not valid')) {
                return Promise.reject(new Error("Your Gemini API key is not valid. Please check the key and try again."));
            }
           return Promise.reject(new Error(`Failed to get insights from Gemini: ${error.message}`));
        }
        return Promise.reject(new Error("An unexpected error occurred while fetching AI insights."));
    }
};