'use server';

import { genkit, AIService, AIMessage } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const googleAILLMService: AIService = {
  name: 'google-ai-llm',
  run: async (messages: AIMessage[], options: any) => {
    // This is where you would call the Google AI LLM
    return {
      choices: [
        {
          message: {
            role: 'model',
            content: [{ text: 'This is a mock response from the Google AI LLM' }],
          },
          finish_reason: 'stop',
          index: 0,
        },
      ],
    };
  },
};

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: ['v1beta'],
    }),
  ],
  logLevel: 'debug',
  enableTracing: true,
});
