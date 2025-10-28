
'use server';

/**
 * @fileOverview AI-powered workout suggestion generator.
 *
 * - generateWorkoutSuggestions - A function that generates workout suggestions based on user data.
 * - GenerateWorkoutSuggestionsInput - The input type for the generateWorkoutSuggestions function.
 * - GenerateWorkoutSuggestionsOutput - The return type for the generateWorkoutSuggestions function.
 */

import {ai} from '@/ai/genkit';
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
  console.log('[AI FLOW] Iniciando o flow com o input:', input);
  
  const result = await generateWorkoutSuggestionsFlow(input);
  
  console.log('[AI FLOW] Flow concluído com o resultado:', result);
  return result;
}

const generateWorkoutSuggestionsPrompt = ai.definePrompt({
  name: 'generateWorkoutSuggestionsPrompt',
  input: { schema: GenerateWorkoutSuggestionsInputSchema },
  output: { schema: GenerateWorkoutSuggestionsOutputSchema },
  model: 'gemini-1.5-flash-latest',
  prompt: `You are an expert swimming coach who provides personalized workout suggestions based on an athlete's performance and goals.

Your response should be a structured workout plan, including warm-up, main set, and cool-down sections.
For each part of the workout, provide specific distances, strokes, and target times or effort levels.

Consider the following information about the athlete when generating workout suggestions:

Past Performance: {{{pastPerformance}}}
Goals: {{{goals}}}

Provide detailed and specific workout suggestions that will help the athlete achieve their goals. Consider available training time and create an actionable plan. Your response must be only the workout plan, formatted as a string. Do not include any introductory phrases like "Here is a workout suggestion". For example:

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
  async (input) => {
    
    console.log('[AI FLOW] Enviando prompt para o modelo...');

    try {
      const response = await generateWorkoutSuggestionsPrompt(input);
      const output = response.output;

      console.log('[AI FLOW] Resposta da API recebida e processada:', output);

      if (!output || !output.workoutSuggestions) {
        throw new Error('A resposta da IA está vazia ou malformada.');
      }
      
      return output;

    } catch (error) {
      console.error('[AI FLOW] Erro ao chamar o prompt de geração:', error);
      if (error instanceof Error) {
        throw new Error(`Erro na API da IA: ${error.message}`);
      }
      throw new Error('Ocorreu um erro desconhecido na geração da IA.');
    }
  }
);
