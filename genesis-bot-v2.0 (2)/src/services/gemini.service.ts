import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { GENESIS_SYSTEM_PROMPT } from './genesis-prompt';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  
  async analyzeMarket(apiKey: string, asset: string, timeframe: string, userObservations: string): Promise<string> {
    if (!apiKey) {
      throw new Error('API Key is required');
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // Construct the user prompt
    let prompt = `Análise solicitada para: ${asset} no Timeframe ${timeframe}.`;
    
    if (userObservations) {
      prompt += `\n\nObservações do utilizador sobre o gráfico atual: ${userObservations}`;
    } else {
      prompt += `\n\nPor favor, verifica o preço atual, a estrutura recente e notícias de impacto para hoje usando Google Search.`;
    }

    prompt += `\n\nFornece a análise completa e o sinal final seguindo estritamente o teu protocolo.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: GENESIS_SYSTEM_PROMPT,
          tools: [{ googleSearch: {} }], // Enable grounding to get real-time context if needed
          temperature: 0.1, // Low temperature for disciplined, logical output
        }
      });

      return response.text || 'Erro: Nenhuma resposta gerada.';
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Falha ao conectar com o Genesis Bot. Verifique sua API Key.');
    }
  }
}