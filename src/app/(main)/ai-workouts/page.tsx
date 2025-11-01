'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { gerarTreinoNatacao } from '@/services/aiService';

interface WorkoutError {
  message: string;
  details?: string;
}

export default function AiWorkoutsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<string | null>(null);
  const [error, setError] = useState<WorkoutError | null>(null);

  const handleGenerateWorkout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);
    setGeneratedWorkout(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const objective = formData.get('objective') as string;
    const focus = (formData.get('focus') as string) || 'Geral';
    const situacaoAtual = `Duração do treino: ${formData.get('duration')} minutos`;

    try {
      const result = await gerarTreinoNatacao(situacaoAtual, `Objetivo: ${objective}, Foco: ${focus}`);
      setGeneratedWorkout(result);
      toast({
        title: 'Treino Gerado!',
        description: 'Um novo treino foi sugerido pela IA.',
      });
    } catch (err: any) {
      console.error('Unexpected error:', err);
      const errorInfo: WorkoutError = {
        message: err.message || 'Ocorreu um erro inesperado ao gerar o treino.',
        details: err.cause?.message || undefined,
      };
      setError(errorInfo);
      toast({
        variant: 'destructive',
        title: 'Erro ao Gerar Treino',
        description: errorInfo.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-semibold">Gerador de Treinos com IA</h1>
      </div>

      <Card className="shadow-md">
        <form onSubmit={handleGenerateWorkout}>
          <CardHeader>
            <CardTitle>Defina seus Objetivos</CardTitle>
            <CardDescription>
              Diga à nossa IA o que você precisa e ela criará um treino personalizado para você.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="objective">Objetivo Principal</Label>
              <Select name="objective" defaultValue="velocidade" required>
                <SelectTrigger id="objective">
                  <SelectValue placeholder="Selecione um objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="velocidade">Velocidade</SelectItem>
                  <SelectItem value="resistencia">Resistência</SelectItem>
                  <SelectItem value="tecnica">Técnica</SelectItem>
                  <SelectItem value="recuperacao">Recuperação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input id="duration" name="duration" type="number" defaultValue="60" placeholder="Ex: 60" required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="focus">Foco Adicional</Label>
              <Input id="focus" name="focus" placeholder="Ex: Melhorar viradas, pernada de borboleta" />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Gerando Treino...' : 'Gerar Treino'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {error.message}
          </AlertTitle>
          {error.details && (
            <AlertDescription className="mt-2 text-xs opacity-80">
                {error.details}
            </AlertDescription>
          )}
        </Alert>
      )}
      
      {generatedWorkout && (
          <Card className="shadow-md">
              <CardHeader>
                  <CardTitle>Sugestão de Treino</CardTitle>
                  <CardDescription>
                    Aqui está o treino gerado pela IA.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="border rounded-lg p-4 whitespace-pre-wrap font-code">
                    {generatedWorkout}
                 </div>
              </CardContent>
              <CardFooter className="justify-end gap-2">
                <Button variant="ghost" onClick={() => setGeneratedWorkout(null)}>Descartar</Button>
              </CardFooter>
          </Card>
      )}

    </div>
  );
}
