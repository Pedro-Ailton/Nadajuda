
'use server';

import {
  generateWorkoutSuggestions,
  type GenerateWorkoutSuggestionsInput,
  type GenerateWorkoutSuggestionsOutput,
} from '@/ai/flows/generate-workout-suggestions';

export async function generateWorkoutSuggestionsAction(
  input: GenerateWorkoutSuggestionsInput
): Promise<{ success: boolean; data?: GenerateWorkoutSuggestionsOutput; error?: string }> {

  try {
    const suggestionResult = await generateWorkoutSuggestions(input);
    
    if (!suggestionResult || !suggestionResult.workoutSuggestions) {
        return { success: false, error: 'A IA retornou uma resposta vazia.' };
    }

    return { success: true, data: suggestionResult };
    
  } catch (error) {
    let errorMessage = 'Falha ao gerar sugestões de treino.';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error);
    }
    return { success: false, error: errorMessage };
  }
}
