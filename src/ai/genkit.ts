import { genkit, configureGenkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { devLogger, startDevServer } from '@genkit-ai/dotprompt';
import 'dotenv/config';

configureGenkit({
  plugins: [
    googleAI(),
    devLogger,
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export { ai } from 'genkit/ai';
