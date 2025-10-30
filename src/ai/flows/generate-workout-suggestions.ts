
'use server';

/**
 * @fileOverview An AI-powered workout suggestion generator.
 * This version calls a real Gemini model to get workout suggestions.
 *
 * - generateWorkoutSuggestions - A function that generates workout suggestions based on user data.
 * - GenerateWorkoutSuggestionsInput - The input type for the generateWorkoutSuggestions function.
 * - GenerateWorkoutSuggestionsOutput - The return type for the generateWorkoutSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';

const GenerateWorkoutSuggestionsInputSchema = z.object({
  pastPerformance:
    z.string().describe("A summary of the athlete's past performance data."),
  goals: z.string().describe("The athlete's training goals."),
});
export type GenerateWorkoutSuggestionsInput = z.infer<
  typeof GenerateWorkoutSuggestionsInputSchema
>;

const GenerateWorkoutSuggestionsOutputSchema = z.object({
  workoutSuggestions: z.string().describe('Workout suggestions tailored to the athlete\'s data.'),
});

export type GenerateWorkoutSuggestionsOutput = z.infer<
  typeof GenerateWorkoutSuggestionsOutputSchema
>;

// This is the main function that the server action will call.
export async function generateWorkoutSuggestions(
  input: GenerateWorkoutSuggestionsInput
): Promise<GenerateWorkoutSuggestionsOutput> {
  // It calls the Genkit flow and returns its output.
  const result = await generateWorkoutSuggestionsFlow(input);
  return result;
}

const generateWorkoutSuggestionsPrompt = ai.definePrompt(
  {
    name: 'generateWorkoutSuggestionsPrompt',
    input: { schema: GenerateWorkoutSuggestionsInputSchema },
    output: { schema: GenerateWorkoutSuggestionsOutputSchema },
    model: googleAI.model('gemini-1.5-flash-latest'),
    prompt: `You are an expert swimming coach. Based on the athlete's past performance and goals, create a detailed and high-quality workout plan. Provide a response in Portuguese.

Past Performance:
{{{pastPerformance}}}

Goals:
{{{goals}}}
`,
  }
);


const generateWorkoutSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateWorkoutSuggestionsFlow',
    inputSchema: GenerateWorkoutSuggestionsInputSchema,
    outputSchema: GenerateWorkoutSuggestionsOutputSchema,
  },
  async (input) => {
    const response = await generateWorkoutSuggestionsPrompt(input);
    const output = response.output();
    if (!output) {
        throw new Error('AI failed to generate a valid workout suggestion.');
    }
    return output;
  }
);
