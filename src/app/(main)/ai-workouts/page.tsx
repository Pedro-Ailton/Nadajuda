'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import type { Workout } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AiWorkoutsPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [isLoading, setIsLoading] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<Workout | null>(null);

  const handleGenerateWorkout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setGeneratedWorkout(null);

    // Placeholder for AI logic
    setTimeout(() => {
        const workout: Workout = {
            id: `ai-${Date.now()}`,
            name: 'Treino de Velocidade (Gerado por IA)',
            date: new Date().toISOString(),
            userProfileId: user?.uid || '',
            workoutItems: [
                { fase: 'Aquecimento', repeticoes: 1, descricao: '400m Livre, leve', intensidade: 'A1', observacoes: 'Respiração 3x1', temposRegistrados: {} },
                { fase: 'Educativos', repeticoes: 8, descricao: '25m Palmateio', intensidade: 'A1', observacoes: 'Foco na técnica', temposRegistrados: {} },
                { fase: 'Série Principal', repeticoes: 10, descricao: '50m Livre, forte', intensidade: 'A2', observacoes: 'Sair a cada 1:00', temposRegistrados: {} },
                { fase: 'Série Principal', repeticoes: 4, descricao: '25m Borboleta, MÁX', intensidade: 'MAX', observacoes: 'Sair a cada 45s', temposRegistrados: {} },
                { fase: 'Relaxamento', repeticoes: 1, descricao: '200m Costas, solto', intensidade: 'A0', observacoes: 'Alongar bem', temposRegistrados: {} },
            ]
        };
      setGeneratedWorkout(workout);
      setIsLoading(false);
      toast({
        title: 'Treino Gerado!',
        description: 'Um novo treino foi sugerido pela IA.',
      });
    }, 2000);
  };

  const handleSaveWorkout = () => {
    if (!generatedWorkout || !user || !firestore) return;
    
    const workoutsCollection = collection(
      firestore,
      'users',
      user.uid,
      'workouts'
    );

    addDocumentNonBlocking(workoutsCollection, generatedWorkout);

    toast({
      title: 'Treino Salvo!',
      description: 'O treino gerado foi adicionado à sua lista.',
    });
    setGeneratedWorkout(null);
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
              <Select name="objective" defaultValue="velocidade">
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
              <Input id="duration" name="duration" type="number" defaultValue="60" placeholder="Ex: 60" />
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
      
      {generatedWorkout && (
          <Card className="shadow-md">
              <CardHeader>
                  <CardTitle>Sugestão de Treino</CardTitle>
                  <CardDescription>
                    Aqui está o treino gerado pela IA. Pode salvá-lo para aceder mais tarde.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="border rounded-lg p-4">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">{generatedWorkout.name}</h3>
                        <span className="text-muted-foreground">{format(new Date(generatedWorkout.date), "PPP", { locale: ptBR })}</span>
                     </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fase</TableHead>
                                <TableHead>Repetições</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Intensidade</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {generatedWorkout.workoutItems?.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.fase}</TableCell>
                                    <TableCell>{item.repeticoes}</TableCell>
                                    <TableCell>{item.descricao}</TableCell>
                                    <TableCell>{item.intensidade}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </div>
              </CardContent>
              <CardFooter className="justify-end gap-2">
                <Button variant="ghost" onClick={() => setGeneratedWorkout(null)}>Descartar</Button>
                <Button onClick={handleSaveWorkout}>Salvar Treino</Button>
              </CardFooter>
          </Card>
      )}

    </div>
  );
}
