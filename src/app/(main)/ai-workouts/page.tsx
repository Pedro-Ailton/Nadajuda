'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore } from '@/firebase';
import { doc, collection, addDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Bot, Loader2, Save } from 'lucide-react';
import type { UserProfile, Workout } from '@/lib/types';
import { generateWorkout } from '@/ai/flows/generate-workout-flow';
import type { GenerateWorkoutOutput } from '@/ai/flows/generate-workout-flow';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  currentSituation: z.string().min(10, 'Por favor, descreva sua situação com um pouco mais de detalhe.'),
  improvementGoals: z.string().min(10, 'Por favor, descreva seus objetivos com um pouco mais de detalhe.'),
});

type FormData = z.infer<typeof formSchema>;

function calculateAge(dateOfBirth: string | undefined): number | undefined {
    if (!dateOfBirth) return undefined;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

export default function AiWorkoutsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<GenerateWorkoutOutput | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    if (!user || !firestore) {
        toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Utilizador não autenticado. Por favor, faça login novamente.',
        });
        return;
    }
    
    setIsLoading(true);
    setGeneratedWorkout(null);

    try {
        // Fetch profile on demand
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Não foi possível carregar o seu perfil. Tente novamente.',
            });
            setIsLoading(false);
            return;
        }

        const userProfile = userDoc.data() as UserProfile;
        const age = calculateAge(userProfile.dateOfBirth);

        if (!age) {
            toast({
                variant: 'destructive',
                title: 'Perfil Incompleto',
                description: 'Por favor, adicione sua data de nascimento no seu perfil para gerar um treino.',
            });
            setIsLoading(false);
            return;
        }

        const result = await generateWorkout({ ...data, userAge: age });
        setGeneratedWorkout(result);

    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Erro ao Gerar Treino',
            description: 'Houve um problema ao comunicar com a IA. Por favor, tente novamente.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleSaveWorkout = async () => {
    if (!generatedWorkout || !user || !firestore) return;
    
    setIsLoading(true);
    try {
      const workoutsCollection = collection(firestore, 'users', user.uid, 'workouts');
      
      const newWorkout: Omit<Workout, 'id'> = {
        name: generatedWorkout.name,
        date: new Date().toISOString(),
        userProfileId: user.uid,
        workoutItems: generatedWorkout.workoutItems,
      };

      await addDoc(workoutsCollection, newWorkout);

      toast({
        title: 'Treino Salvo!',
        description: `O treino "${generatedWorkout.name}" foi adicionado à sua lista.`,
      });
      setGeneratedWorkout(null); // Clear after saving
    } catch (error) {
      console.error("Error saving workout: ", error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Salvar',
        description: 'Não foi possível salvar o treino. Tente novamente.',
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Bot className="h-8 w-8" />
        <h1 className="font-headline text-3xl font-semibold">Gerador de Treinos com IA</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crie seu Treino Personalizado</CardTitle>
          <CardDescription>
            Descreva sua condição física atual e seus objetivos para que a nossa IA crie o treino perfeito para você. A sua idade será usada para ajustar o treino.
          </CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentSituation">Minha Situação Atual</Label>
              <Textarea
                id="currentSituation"
                placeholder="Ex: Sou um nadador iniciante, nado 2 vezes por semana. Tenho dificuldade em manter o ritmo em distâncias longas."
                {...form.register('currentSituation')}
                className="min-h-[100px]"
              />
              {form.formState.errors.currentSituation && <p className="text-sm text-destructive">{form.formState.errors.currentSituation.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="improvementGoals">O que Desejo Melhorar</Label>
              <Textarea
                id="improvementGoals"
                placeholder="Ex: Quero melhorar minha resistência para conseguir nadar 1500m sem parar. Também quero aperfeiçoar minha técnica de nado crawl."
                {...form.register('improvementGoals')}
                className="min-h-[100px]"
              />
              {form.formState.errors.improvementGoals && <p className="text-sm text-destructive">{form.formState.errors.improvementGoals.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Gerando Treino...' : 'Gerar Treino'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {generatedWorkout && (
        <Card>
            <CardHeader>
                <CardTitle>{generatedWorkout.name}</CardTitle>
                <CardDescription>Este é o treino que a IA gerou para você. Se gostar, pode salvá-lo no seu perfil.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fase</TableHead>
                                <TableHead>Repetições</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Intensidade</TableHead>
                                <TableHead>Observações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {generatedWorkout.workoutItems.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{item.fase}</TableCell>
                                    <TableCell>{item.repeticoes > 0 ? item.repeticoes : '-'}</TableCell>
                                    <TableCell>{item.descricao}</TableCell>
                                    <TableCell>{item.intensidade}</TableCell>
                                    <TableCell>{item.observacoes}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </div>
            </CardContent>
            <CardFooter className="justify-end">
                <Button onClick={handleSaveWorkout} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar Treino
                </Button>
            </CardFooter>
        </Card>
      )}

    </div>
  );
}
