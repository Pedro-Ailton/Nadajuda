'use server';
/**
 * @fileOverview An AI flow for generating personalized swimming workouts.
 *
 * - generateWorkout - A function that handles the workout generation process.
 */

import { ai } from '@/ai/genkit';
import { GenerateWorkoutInputSchema, GenerateWorkoutOutputSchema } from '@/lib/schemas';
import type { GenerateWorkoutInput, GenerateWorkoutOutput } from '@/lib/types';


export async function generateWorkout(input: GenerateWorkoutInput): Promise<GenerateWorkoutOutput> {
  return generateWorkoutFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWorkoutPrompt',
  model: 'googleai/gemini-pro',
  input: { schema: GenerateWorkoutInputSchema },
  output: { schema: GenerateWorkoutOutputSchema },
  config: {
    response: {
      format: 'json',
    },
  },
  prompt: `You are a world-class swimming coach AI. Your task is to generate a personalized swimming workout plan based on the user's details.

User's Age: {{userAge}}
User's Current Situation: {{{currentSituation}}}
User's Improvement Goals: {{{improvementGoals}}}

Based on this information, create a structured and effective swimming workout. The workout should have a clear name and a series of workout items.

The workout items should be structured into phases: 'Aquecimento' (Warm-up), 'Série Principal' (Main Set), and 'Relaxamento' (Cool-down).
The 'descricao' for each item should be specific (e.g., '4x50m Livre A1', '200m Pernada com prancha').
The 'intensidade' should use standard swimming codes (e.g., A1, A2, A3, MAX).
The 'observacoes' should include rest times (e.g., 'desc. 30s') or specific instructions (e.g., 'com palmar').

Generate a workout with a total of 5 to 10 items. Ensure the output strictly follows the provided JSON schema format.
Provide the response in Portuguese (Brazil).`,
});

const generateWorkoutFlow = ai.defineFlow(
  {
    name: 'generateWorkoutFlow',
    inputSchema: GenerateWorkoutInputSchema,
    outputSchema: GenerateWorkoutOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
