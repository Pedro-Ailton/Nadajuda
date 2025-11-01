'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Bot, Loader2, Save } from 'lucide-react';
import type { UserProfile, Workout, GenerateWorkoutOutput } from '@/lib/types';
import { generateWorkout } from '@/ai/flows/generate-workout-flow';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDoc } from '@/firebase/firestore/use-doc';

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
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<GenerateWorkoutOutput | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentSituation: '',
      improvementGoals: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user || !userProfile) {
        toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Não foi possível carregar o seu perfil. Tente novamente.',
        });
        return;
    }
    
    setIsGenerating(true);
    setGeneratedWorkout(null);

    try {
        const age = calculateAge(userProfile.dateOfBirth);

        if (!age) {
            toast({
                variant: 'destructive',
                title: 'Perfil Incompleto',
                description: 'Por favor, adicione sua data de nascimento no seu perfil para gerar um treino.',
            });
            setIsGenerating(false);
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
        setIsGenerating(false);
    }
  };

  const handleSaveWorkout = async () => {
    if (!generatedWorkout || !user || !firestore) return;
    
    setIsSaving(true);
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
        setIsSaving(false);
    }
  };

  const isLoading = isGenerating || isSaving || isProfileLoading;

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
            Descreva sua condição física atual e seus objetivos para que a nossa IA crie o treino perfeito para você. A sua idade, guardada no seu perfil, será usada para ajustar o treino.
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
              {form.formState.errors.improvementGoals && <p className="text-sm text-destructive">{form.formState.errors.improvementGoals.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isProfileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isProfileLoading ? 'Carregando perfil...' : (isGenerating ? 'Gerando Treino...' : 'Gerar Treino')}
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
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar Treino
                </Button>
            </CardFooter>
        </Card>
      )}

    </div>
  );
}
