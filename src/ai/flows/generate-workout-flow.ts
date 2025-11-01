'use server';
/**
 * @fileOverview A swimming workout generation AI agent using Hugging Face API.
 */

import { z } from 'zod';
import { WorkoutSchema } from '@/lib/schemas';

const GenerateWorkoutInputSchema = z.object({
  objective: z.string().describe('The main goal of the workout (e.g., speed, endurance, technique).'),
  duration: z.coerce.number().describe('The total duration of the workout in minutes.'),
  focus: z.string().optional().describe('Any additional focus for the workout (e.g., improving turns, butterfly kick).'),
  userProfileId: z.string().describe("The user's unique ID."),
});
export type GenerateWorkoutInput = z.infer<typeof GenerateWorkoutInputSchema>;
export type GenerateWorkoutOutput = z.infer<typeof WorkoutSchema>;

// Return type for errors
export type WorkoutResult = 
  | { success: true; data: GenerateWorkoutOutput }
  | { success: false; error: { message: string; code: string; details?: string } };

// Modelos mais acessíveis para contas gratuitas
const MODELS = [
  'mistralai/Mistral-7B-Instruct-v0.1',
  'HuggingFaceH4/zephyr-7b-beta',
  'google/flan-t5-base',
  'facebook/opt-1.3b',
  'EleutherAI/gpt-neo-1.3B',
];

async function callHuggingFaceAPI(prompt: string, modelIndex: number = 0): Promise<{ success: boolean; data?: string; error?: any }> {
  // Validate API key exists
  const apiKey = process.env.HUGGINGFACE_API_KEY || 
                 process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY ||
                 process.env.HF_API_KEY;
  
  if (!apiKey || apiKey.trim() === '') {
    console.error('❌ API Key não encontrada');
    return {
      success: false,
      error: {
        message: 'Chave API do Hugging Face não configurada',
        code: 'MISSING_API_KEY',
        details: 'Verifique se HUGGINGFACE_API_KEY está definida no arquivo .env'
      }
    };
  }

  if (modelIndex >= MODELS.length) {
    return {
      success: false,
      error: {
        message: 'Nenhum modelo disponível',
        code: 'NO_MODELS_AVAILABLE',
        details: 'Todos os modelos tentados estão indisponíveis. Verifique se sua API key tem permissões adequadas ou tente novamente mais tarde.'
      }
    };
  }

  const currentModel = MODELS[modelIndex];
  const HUGGINGFACE_API_URL = `https://api-inference.huggingface.co/models/${currentModel}`;

  console.log(`🔄 Tentando modelo ${modelIndex + 1}/${MODELS.length}: ${currentModel}`);

  try {
    const response = await fetch(HUGGINGFACE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 1500,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false,
        },
        options: {
          wait_for_model: true,
          use_cache: false,
        }
      }),
    });

    console.log(`📊 Status: ${response.status} para modelo ${currentModel}`);

    if (!response.ok) {
      let errorData: any = null;
      let errorText = '';
      
      try {
        errorData = await response.json();
        errorText = JSON.stringify(errorData, null, 2);
        console.error(`❌ Erro da API (${currentModel}):`, errorText);
      } catch {
        errorText = response.statusText;
        console.error(`❌ Erro da API (${currentModel}, sem JSON):`, errorText);
      }

      // Log detalhado do erro
      console.log(`⚠️ Detalhes do erro para ${currentModel}:`);
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Erro: ${errorText}`);

      // Se for 404 ou 403, tentar o próximo modelo
      if (response.status === 404 || response.status === 403) {
        console.log(`⚠️ Modelo ${currentModel} não acessível (${response.status}), tentando próximo...`);
        return await callHuggingFaceAPI(prompt, modelIndex + 1);
      }

      if (response.status === 401) {
        return {
          success: false,
          error: {
            message: 'Chave API inválida',
            code: 'INVALID_API_KEY',
            details: 'A chave API do Hugging Face está incorreta ou expirada. Verifique em: https://huggingface.co/settings/tokens'
          }
        };
      } else if (response.status === 503) {
        const estimatedTime = errorData?.estimated_time || 20;
        console.log(`⏳ Modelo ${currentModel} carregando (estimado: ${estimatedTime}s)...`);
        
        // Se o tempo estimado for razoável (< 60s), esperar e tentar de novo
        if (estimatedTime < 60) {
          console.log(`⏰ Aguardando ${estimatedTime + 5} segundos...`);
          await new Promise(resolve => setTimeout(resolve, (estimatedTime + 5) * 1000));
          console.log(`🔄 Tentando ${currentModel} novamente após espera...`);
          
          // Tentar o mesmo modelo de novo
          const retryResponse = await fetch(HUGGINGFACE_API_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: {
                max_new_tokens: 1500,
                temperature: 0.7,
                top_p: 0.9,
                do_sample: true,
                return_full_text: false,
              },
              options: {
                wait_for_model: true,
                use_cache: false,
              }
            }),
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            const generatedText = retryData[0]?.generated_text || retryData?.generated_text;
            if (generatedText) {
              console.log(`✅ Sucesso após espera com ${currentModel}`);
              return { success: true, data: generatedText };
            }
          }
        }
        
        // Se não deu certo ou tempo muito longo, tentar próximo modelo
        console.log(`⚠️ Tentando próximo modelo...`);
        return await callHuggingFaceAPI(prompt, modelIndex + 1);
      } else if (response.status === 429) {
        return {
          success: false,
          error: {
            message: 'Limite de requisições excedido',
            code: 'RATE_LIMIT',
            details: 'Muitas requisições. Aguarde alguns minutos antes de tentar novamente.'
          }
        };
      } else {
        // Tentar próximo modelo em caso de outros erros
        console.log(`⚠️ Erro ${response.status} no modelo ${currentModel}, tentando próximo...`);
        return await callHuggingFaceAPI(prompt, modelIndex + 1);
      }
    }

    const data = await response.json();
    console.log(`✅ Resposta recebida do modelo: ${currentModel}`);

    const generatedText = data[0]?.generated_text || data?.generated_text;
    
    if (!generatedText) {
      console.error(`❌ Resposta vazia de ${currentModel}, tentando próximo modelo...`);
      console.error('Estrutura da resposta:', JSON.stringify(data, null, 2));
      return await callHuggingFaceAPI(prompt, modelIndex + 1);
    }

    console.log(`✅ Texto gerado com ${currentModel} (primeiros 200 chars):`, generatedText.substring(0, 200));
    return { success: true, data: generatedText };

  } catch (error) {
    console.error(`❌ Erro de conexão com ${currentModel}:`, error);
    // Tentar próximo modelo em caso de erro de conexão
    console.log(`⚠️ Tentando próximo modelo após erro de conexão...`);
    return await callHuggingFaceAPI(prompt, modelIndex + 1);
  }
}

function buildPrompt(input: GenerateWorkoutInput): string {
  const exampleJSON = `{
  "name": "Treino de Velocidade - 60min",
  "workoutItems": [
    {
      "fase": "Aquecimento",
      "repeticoes": 1,
      "descricao": "400m nado livre suave",
      "intensidade": "Leve",
      "observacoes": "Foque na técnica e respiração",
      "temposRegistrados": []
    },
    {
      "fase": "Série Principal",
      "repeticoes": 8,
      "descricao": "50m sprint com 30s descanso",
      "intensidade": "Alta",
      "observacoes": "Máxima velocidade",
      "temposRegistrados": []
    }
  ]
}`;

  return `Create a swimming workout in JSON format.

Objective: ${input.objective}
Duration: ${input.duration} minutes
Focus: ${input.focus || 'General'}

Return ONLY this JSON structure in Portuguese:
${exampleJSON}

JSON:`;
}

export async function generateWorkoutFlow(input: GenerateWorkoutInput): Promise<WorkoutResult> {
  console.log('🏊 Iniciando geração de treino...');
  console.log('📋 Input:', JSON.stringify(input, null, 2));
  
  const workoutData = {
    ...input,
    id: `ai-${Date.now()}`,
    date: new Date().toISOString(),
  };

  try {
    const prompt = buildPrompt(input);
    console.log('📝 Prompt construído (tamanho):', prompt.length);
    
    const apiResult = await callHuggingFaceAPI(prompt);

    if (!apiResult.success) {
      console.error('❌ Falha em todos os modelos');
      return {
        success: false,
        error: apiResult.error!
      };
    }

    const response = apiResult.data!;

    // Parse the JSON response
    console.log('🔍 Tentando extrair JSON da resposta...');
    console.log('📄 Resposta completa:', response.substring(0, 500));
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ Nenhum JSON encontrado');
      return {
        success: false,
        error: {
          message: 'JSON não encontrado na resposta',
          code: 'NO_JSON',
          details: `Resposta: ${response.substring(0, 300)}`
        }
      };
    }

    console.log('✅ JSON encontrado, tentando parsear...');
    let parsedOutput;
    
    try {
      parsedOutput = JSON.parse(jsonMatch[0]);
      console.log('✅ JSON parseado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao parsear JSON:', error);
      return {
        success: false,
        error: {
          message: 'Erro ao interpretar resposta da IA',
          code: 'JSON_PARSE_ERROR',
          details: error instanceof Error ? error.message : 'Erro desconhecido'
        }
      };
    }

    // Validate against schema
    console.log('✅ Validando contra schema...');
    try {
      const validatedOutput = WorkoutSchema.parse(parsedOutput);
      console.log('✅ Validação bem-sucedida');
      
      const finalWorkout = {
        ...validatedOutput,
        id: workoutData.id,
        date: workoutData.date,
        userProfileId: input.userProfileId,
      };

      console.log('✅ Treino gerado com sucesso!');
      return {
        success: true,
        data: finalWorkout
      };

    } catch (error) {
      console.error('❌ Erro de validação:', error);
      return {
        success: false,
        error: {
          message: 'Resposta da IA não está no formato correto',
          code: 'VALIDATION_ERROR',
          details: error instanceof Error ? error.message : 'Erro de validação'
        }
      };
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return {
      success: false,
      error: {
        message: 'Erro inesperado ao gerar treino',
        code: 'UNEXPECTED_ERROR',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    };
  }
}