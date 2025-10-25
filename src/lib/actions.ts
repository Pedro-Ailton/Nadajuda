
'use server';

import {
  generateWorkoutSuggestions,
  type GenerateWorkoutSuggestionsInput,
} from '@/ai/flows/generate-workout-suggestions';

export async function generateWorkoutSuggestionsAction(
  input: GenerateWorkoutSuggestionsInput
) {
  try {
    const suggestions = await generateWorkoutSuggestions(input);
    return { success: true, data: suggestions };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Falha ao gerar sugestões de treino.' };
  }
}
