'use server';
/**
 * @fileOverview An AI flow for generating personalized swimming workouts.
 *
 * - generateWorkout - A function that handles the workout generation process.
 * - GenerateWorkoutInput - The input type for the generateWorkout function.
 * - GenerateWorkoutOutput - The return type for the generateWorkout function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { WorkoutItemSchema, WorkoutSchema } from '@/lib/schemas';

export const GenerateWorkoutInputSchema = z.object({
  currentSituation: z.string().describe("The user's current situation or fitness level."),
  improvementGoals: z.string().describe("What the user wants to improve."),
  userAge: z.number().describe('The age of the user.'),
});
export type GenerateWorkoutInput = z.infer<typeof GenerateWorkoutInputSchema>;

// The output will be a simplified workout structure, as the full workout object will be constructed on the client.
export const GenerateWorkoutOutputSchema = z.object({
    name: z.string().describe("A creative and descriptive name for the generated workout session (e.g., 'Resilience Build-up', 'Sprint Power')."),
    workoutItems: z.array(WorkoutItemSchema).describe("An array of workout items that make up the session. It should contain between 5 and 10 items, covering warm-up, main set, and cool-down."),
});
export type GenerateWorkoutOutput = z.infer<typeof GenerateWorkoutOutputSchema>;


export async function generateWorkout(input: GenerateWorkoutInput): Promise<GenerateWorkoutOutput> {
  return generateWorkoutFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWorkoutPrompt',
  input: { schema: GenerateWorkoutInputSchema },
  output: { schema: GenerateWorkoutOutputSchema },
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
