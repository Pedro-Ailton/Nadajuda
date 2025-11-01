"use server";

// Configuração da IA
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
const API_KEY = process.env.HUGGINGFACE_API_KEY;

// Função que conversa com a IA  
export async function gerarTreinoNatacao(
  situacaoAtual: string,
  objetivoMelhoria: string
): Promise<string> {
  
  // Monta a pergunta para a IA
  const prompt = `Você é um técnico experiente de natação. Com base nas informações abaixo, sugira um treino completo e detalhado.

Situação atual do atleta: ${situacaoAtual}
O que deseja melhorar: ${objetivoMelhoria}

Crie um treino de natação detalhado incluindo:
- Aquecimento
- Série principal
- Desaquecimento
- Dicas técnicas

Treino:`;

  try {
    // Envia a pergunta para a IA usando fetch
    const response = await fetch(
      HUGGINGFACE_API_URL,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            top_p: 0.9,
          }
        }),
      }
    );

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    const responseData = await response.json();

    // Pega a resposta da IA
    const treinoGerado = responseData[0].generated_text;
    
    // Remove o prompt da resposta (só queremos o treino)
    const treino = treinoGerado.replace(prompt, '').trim();
    
    return treino;
    
  } catch (erro: any) {
    console.error('Erro ao gerar treino:', erro);
    throw new Error(`Não foi possível gerar o treino. Detalhes: ${erro.message}`);
  }
}
