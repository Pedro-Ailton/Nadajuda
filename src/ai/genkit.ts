import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import 'dotenv/config';

// Initialize Genkit and the Google AI plugin.
// This `ai` object will be used throughout the application to interact with AI models.
export const ai = genkit({
  plugins: [googleAI()],
});
