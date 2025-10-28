
'use server';

import {
  generateWorkoutSuggestions,
  type GenerateWorkoutSuggestionsInput,
  type GenerateWorkoutSuggestionsOutput,
} from '@/ai/flows/generate-workout-suggestions';

export async function generateWorkoutSuggestionsAction(
  input: GenerateWorkoutSuggestionsInput
): Promise<{ success: boolean; data?: GenerateWorkoutSuggestionsOutput; error?: string }> {
  console.log('[ACTION] Iniciando a geração de sugestões. Input recebido:', input);

  try {
    const suggestionResult = await generateWorkoutSuggestions(input);
    
    console.log('[ACTION] Resposta recebida do flow:', JSON.stringify(suggestionResult, null, 2));

    if (!suggestionResult || !suggestionResult.workoutSuggestions) {
        console.error('[ACTION] Erro: O flow de IA retornou uma resposta vazia ou malformada.');
        return { success: false, error: 'A IA retornou uma resposta vazia.' };
    }

    console.log('[ACTION] Sucesso! Enviando dados para o frontend.');
    return { success: true, data: suggestionResult };
    
  } catch (error) {
    console.error('[ACTION] Ocorreu um erro catastrófico ao chamar o flow de IA:', error);
    let errorMessage = 'Falha ao gerar sugestões de treino. Verifique os logs do servidor.';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error);
    }
    return { success: false, error: errorMessage };
  }
}
