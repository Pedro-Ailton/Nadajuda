
'use server';

import {
  generateWorkoutSuggestions,
  type GenerateWorkoutSuggestionsInput,
  type GenerateWorkoutSuggestionsOutput,
} from '@/ai/flows/generate-workout-suggestions';

export async function generateWorkoutSuggestionsAction(
  input: GenerateWorkoutSuggestionsInput
): Promise<{ success: boolean; data?: GenerateWorkoutSuggestionsOutput; error?: string }> {
  
  console.log('[ACTION] Iniciando a geração de sugestões com o input:', input);

  try {
    const suggestionResult = await generateWorkoutSuggestions(input);
    
    console.log('[ACTION] Resultado recebido do flow:', suggestionResult);

    if (!suggestionResult || !suggestionResult.workoutSuggestions) {
      console.error('[ACTION] Erro: A IA retornou uma resposta vazia ou malformada.');
      return { success: false, error: 'A IA retornou uma resposta vazia.' };
    }

    return { success: true, data: suggestionResult };
    
  } catch (error) {
    console.error('[ACTION] Erro capturado ao chamar o flow da IA:', error);
    let errorMessage = 'Falha ao gerar sugestões de treino.';
    
    if (error instanceof Error) {
      // Retorna a mensagem de erro específica para o frontend.
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error);
    }
    
    return { success: false, error: errorMessage };
  }
}
