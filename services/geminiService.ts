
import { GoogleGenAI, Type } from "@google/genai";
import { Stock, NewsItem } from "../types";

// Initialize Gemini API client with required API key configuration
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMarketNews = async (stocks: Record<string, Stock>): Promise<NewsItem> => {
  const stockInfo = Object.values(stocks).map(s => `${s.symbol} (${s.name}) in ${s.sector}`).join(', ');
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a realistic breaking news headline and a short 2-sentence description for a fictional stock market. 
      Available companies: ${stockInfo}. 
      Randomly pick ONE company or a general market event.
      Provide the impact (positive, negative, neutral) and which symbol it affects.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            content: { type: Type.STRING },
            impact: { type: Type.STRING, enum: ['positive', 'negative', 'neutral'] },
            affectedSymbol: { type: Type.STRING }
          },
          required: ["headline", "content", "impact", "affectedSymbol"]
        }
      }
    });

    // Access the generated text content directly via the .text property
    const data = JSON.parse(response.text || '{}');
    return {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      headline: data.headline || "Market Update",
      content: data.content || "Prices are moving as trading volume spikes.",
      impact: data.impact || "neutral",
      affectedSymbol: data.affectedSymbol
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      headline: "Market Volatility Continues",
      content: "Traders are watching the indices closely as economic data releases loom.",
      impact: "neutral"
    };
  }
};

export const getMarketAnalysis = async (stock: Stock): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Act as a senior market analyst. Provide a 2-sentence investment thesis for ${stock.name} (${stock.symbol}) in the ${stock.sector} sector. Current price is $${stock.price.toFixed(2)}.`,
    });
    // Use .text property to retrieve results from GenerateContentResponse
    return response.text || "Analysis currently unavailable.";
  } catch (error) {
    return "The market is currently digesting new information. Stay tuned for further analysis.";
  }
};
