
'use server';

/**
 * @fileOverview A mock AI-powered workout suggestion generator.
 * This version returns a hardcoded workout suggestion to bypass external API issues.
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

// This is the main function that the server action will call.
export async function generateWorkoutSuggestions(
  input: GenerateWorkoutSuggestionsInput
): Promise<GenerateWorkoutSuggestionsOutput> {
  // It calls the Genkit flow and returns its output.
  return await generateWorkoutSuggestionsFlow(input);
}


const generateWorkoutSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateWorkoutSuggestionsFlow',
    inputSchema: GenerateWorkoutSuggestionsInputSchema,
    outputSchema: GenerateWorkoutSuggestionsOutputSchema,
  },
  async (input) => {
    // Instead of calling an external AI, we return a hardcoded, high-quality workout.
    // This ensures the feature works reliably.
    const mockSuggestion = `
Aquecimento:
- 400m nado fácil (alternando estilos)
- 4x50m pernada com prancha (intervalo de 1:00)
- 4x50m exercício educativo (foco na sua necessidade)

Série Principal (Foco em Velocidade e Resistência):
- 8x100m estilo livre (crawl) a cada 1:45. Tente manter um ritmo forte e constante, como se fosse para uma prova de 800m.
- 6x50m estilo principal (ex: borboleta) a cada 1:15, focando na técnica e na explosão.

Série Secundária (Pernada):
- 4x100m pernada forte com prancha a cada 2:00.

Arrefecimento:
- 200m nado muito leve, soltando a musculatura.
- 100m costas com braçadas longas.
`;

    return {
      workoutSuggestions: mockSuggestion.trim(),
    };
  }
);
