
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

export async function generateWorkoutSuggestions(
  input: GenerateWorkoutSuggestionsInput
): Promise<GenerateWorkoutSuggestionsOutput> {
  console.log('[AI FLOW] Flow iniciado com o input:', input);
  try {
    const result = await generateWorkoutSuggestionsFlow(input);
    console.log('[AI FLOW] Resultado do flow recebido:', result);
    return result;
  } catch (error) {
    console.error('[AI FLOW] Erro ao executar o flow:', error);
    // Rethrow para que a Server Action possa capturar
    throw error;
  }
}

const generateWorkoutSuggestionsPrompt = ai.definePrompt(
  {
    name: 'generateWorkoutSuggestionsPrompt',
    model: googleAI.model('gemini-1.0-pro'),
    input: { schema: GenerateWorkoutSuggestionsInputSchema },
    output: { schema: GenerateWorkoutSuggestionsOutputSchema },
    prompt: `You are an expert swimming coach who provides personalized workout suggestions based on an athlete's performance and goals.

Your response should be a structured workout plan, including warm-up, main set, and cool-down sections.
For each part of the workout, provide specific distances, strokes, and target times or effort levels.

Consider the following information about the athlete when generating workout suggestions:

Past Performance: {{{pastPerformance}}}
Goals: {{{goals}}}

Provide detailed and specific workout suggestions that will help the athlete achieve their goals. Consider available training time and create an actionable plan. Your response must be only the workout plan text, without any introductory phrases like "Here is a workout suggestion". For example:

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
  },
);


const generateWorkoutSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateWorkoutSuggestionsFlow',
    inputSchema: GenerateWorkoutSuggestionsInputSchema,
    outputSchema: GenerateWorkoutSuggestionsOutputSchema,
  },
  async (input) => {
    console.log('[AI FLOW] Enviando prompt para o modelo...');
    const { output } = await generateWorkoutSuggestionsPrompt(input);

    if (!output?.workoutSuggestions) {
      console.error('[AI FLOW] Erro: A resposta da IA está vazia ou malformada.');
      throw new Error('A resposta da IA está vazia ou malformada.');
    }
    
    console.log('[AI FLOW] Resposta da IA recebida e processada com sucesso.');
    return output;
  }
);
