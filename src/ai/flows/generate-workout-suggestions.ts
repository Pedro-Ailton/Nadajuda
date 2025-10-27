'use server';

/**
 * @fileOverview AI-powered workout suggestion generator.
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
    z.string().describe('A summary of the athlete\'s past performance data.'),
  goals: z.string().describe('The athlete\'s training goals.'),
  athleteType: z.string().describe('The type of athlete.'),
  eventPreference: z.string().describe('The athletes preferred event.'),
});
export type GenerateWorkoutSuggestionsInput = z.infer<
  typeof GenerateWorkoutSuggestionsInputSchema
>;

const GenerateWorkoutSuggestionsOutputSchema = z.object({
  workoutSuggestions:
    z.string().describe('Workout suggestions tailored to the athlete\'s data.'),
});
export type GenerateWorkoutSuggestionsOutput = z.infer<
  typeof GenerateWorkoutSuggestionsOutputSchema
>;

export async function generateWorkoutSuggestions(
  input: GenerateWorkoutSuggestionsInput
): Promise<GenerateWorkoutSuggestionsOutput> {
  return generateWorkoutSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWorkoutSuggestionsPrompt',
  input: {schema: GenerateWorkoutSuggestionsInputSchema},
  output: {schema: GenerateWorkoutSuggestionsOutputSchema},
  model: googleAI.model('gemini-pro'),
  prompt: `You are an expert swimming coach who provides personalized workout suggestions based on an athlete's performance, goals and preferences.

  Your response should be a structured workout plan, including warm-up, main set, and cool-down sections.
  For each part of the workout, provide specific distances, strokes, and target times or effort levels.

  Consider the following information about the athlete when generating workout suggestions:

  Past Performance: {{{pastPerformance}}}
  Goals: {{{goals}}}
  Type of Athlete: {{{athleteType}}}
  Preferred Event: {{{eventPreference}}}

  Provide detailed and specific workout suggestions that will help the athlete achieve their goals. Consider available training time and create an actionable plan. For example:

  Warm-up:
  - 400m easy swim (mix strokes)
  - 4x50m kick on 1:00
  - 4x50m drill on 1:00

  Main Set:
  - 8x100m freestyle on 1:30 (hold pace for 500m race)

  Cool-down:
  - 200m easy pull
  - 100m backstroke
  `,
});

const generateWorkoutSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateWorkoutSuggestionsFlow',
    inputSchema: GenerateWorkoutSuggestionsInputSchema,
    outputSchema: GenerateWorkoutSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
