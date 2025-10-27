
'use server';

import {
  generateWorkoutSuggestions,
  type GenerateWorkoutSuggestionsInput,
} from '@/ai/flows/generate-workout-suggestions';

export async function generateWorkoutSuggestionsAction(
  input: GenerateWorkoutSuggestionsInput
) {
  try {
    const suggestionText = await generateWorkoutSuggestions(input);
    // suggestionText is the string returned directly from the flow
    return { success: true, data: { workoutSuggestions: suggestionText } };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Falha ao gerar sugestões de treino.' };
  }
}
