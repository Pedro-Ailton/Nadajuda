'use server';
/**
 * @fileOverview A swimming workout generation AI agent.
 *
 * - generateWorkoutFlow - A function that handles the workout generation process.
 * - GenerateWorkoutInput - The input type for the generateWorkout function.
 * - GenerateWorkoutOutput - The return type for the generateWorkout function, which is a structured Workout object.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { WorkoutSchema } from '@/lib/schemas';
import { googleAI } from '@genkit-ai/google-genai';

// Define the input schema for the workout generation flow
const GenerateWorkoutInputSchema = z.object({
  objective: z.string().describe('The main goal of the workout (e.g., speed, endurance, technique).'),
  duration: z.coerce.number().describe('The total duration of the workout in minutes.'),
  focus: z.string().optional().describe('Any additional focus for the workout (e.g., improving turns, butterfly kick).'),
  userProfileId: z.string().describe("The user's unique ID."),
});
export type GenerateWorkoutInput = z.infer<typeof GenerateWorkoutInputSchema>;

// Define the output schema, which is simply the Workout schema
export type GenerateWorkoutOutput = z.infer<typeof WorkoutSchema>;

// Define the prompt for the AI model
const prompt = ai.definePrompt({
  name: 'generateWorkoutPrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: { schema: GenerateWorkoutInputSchema },
  output: { schema: WorkoutSchema },
  prompt: `You are an expert swimming coach named "NadAjuda AI". Your task is to create a personalized swimming workout plan.

You will receive the user's main objective, the desired workout duration in minutes, and an optional additional focus. You must generate a complete workout session structured in phases (Warm-up, Drills, Main Set, Cool-down).

The workout name should be creative and reflect the main objective (e.g., "Explosão de Velocidade", "Maratona Aquática", "Técnica Apurada").

The workout items should be detailed and follow a logical progression. The total duration of all items should be close to the user-specified duration. Use Portuguese (Brazil) for all descriptions and names.

IMPORTANT: You MUST provide a value for every field in the output schema. If a field like 'intensidade' or 'observacoes' is not relevant for a specific item, provide an empty string "" instead of omitting it. For 'repeticoes', provide 0 if not applicable. For 'temposRegistrados', provide an empty array [] if not applicable.

Workout Details:
- Main Objective: {{{objective}}}
- Total Duration: {{{duration}}} minutes
- Additional Focus: {{{focus}}}

Generate a response in the specified JSON format. Ensure the 'userProfileId' and 'date' are set correctly. The 'id' can be a placeholder.
`,
});

// Define the Genkit flow
export const generateWorkoutFlow = ai.defineFlow(
  {
    name: 'generateWorkoutFlow',
    inputSchema: GenerateWorkoutInputSchema,
    outputSchema: WorkoutSchema,
  },
  async (input) => {
    // Generate a new ID and set the current date
    const workoutData = {
      ...input,
      id: `ai-${Date.now()}`,
      date: new Date().toISOString(),
    };

    // Call the prompt with the enriched input data
    const { output } = await prompt(workoutData);

    // Ensure the output is not null and add the final details
    if (!output) {
      throw new Error('Failed to generate workout from AI.');
    }

    // Return the final workout object directly
    return {
      ...output,
      id: workoutData.id,
      date: workoutData.date,
      userProfileId: input.userProfileId,
    };
  }
);
