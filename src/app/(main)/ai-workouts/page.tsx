'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore } from '@/firebase';
import { doc, collection, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Bot, Loader2, Save } from 'lucide-react';
import type { Workout, GenerateWorkoutOutput } from '@/lib/types';
import { generateWorkout } from '@/ai/flows/generate-workout-flow';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useMemoFirebase } from '@/firebase/provider';
import type { UserProfile } from '@/lib/types';


export default function AiWorkoutsPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
      }, [firestore, user]);
      
    const { data: userProfile } = useDoc<UserProfile>(userDocRef);

    const [currentSituation, setCurrentSituation] = useState('');
    const [improvementGoals, setImprovementGoals] = useState('');
    const [generatedWorkout, setGeneratedWorkout] = useState<GenerateWorkoutOutput | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const calculateAge = (dateOfBirth: string | undefined): number => {
        if (!dateOfBirth) return 30; // Default age if not provided
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    const handleGenerateWorkout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentSituation.trim() || !improvementGoals.trim()) {
             toast({
                variant: 'destructive',
                title: 'Campos em Falta',
                description: 'Por favor, preencha a sua situação atual e os seus objetivos.',
            });
            return;
        }

        setIsGenerating(true);
        setGeneratedWorkout(null);
        try {
            const userAge = calculateAge(userProfile?.dateOfBirth);
            const workout = await generateWorkout({ currentSituation, improvementGoals, userAge });
            setGeneratedWorkout(workout);
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Erro de IA',
                description: 'Houve um problema na geração do treino. Tente novamente.',
            });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSaveWorkout = async (workoutToSave: GenerateWorkoutOutput) => {
        if (!user || !firestore) return;
        
        setIsSaving(true);
        try {
          const workoutsCollection = collection(firestore, 'users', user.uid, 'workouts');
          
          const newWorkout: Omit<Workout, 'id'> = {
            name: workoutToSave.name,
            date: new Date().toISOString(),
            userProfileId: user.uid,
            workoutItems: workoutToSave.workoutItems.map(item => ({...item, temposRegistrados: []})),
          };
    
          await addDoc(workoutsCollection, newWorkout);
    
          toast({
            title: 'Treino Salvo!',
            description: `O treino "${workoutToSave.name}" foi adicionado à sua lista.`,
          });

          // Clear the form and the generated workout
          setGeneratedWorkout(null);
          setCurrentSituation('');
          setImprovementGoals('');

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


    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
                <Bot className="h-8 w-8" />
                <h1 className="font-headline text-3xl font-semibold">Gerador de Treino IA</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Crie o seu Treino Personalizado</CardTitle>
                        <CardDescription>Descreva como se sente e o que pretende melhorar. A IA criará um treino à sua medida.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleGenerateWorkout} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="current-situation">Como está seu desempenho atual?</Label>
                                <Textarea
                                    id="current-situation"
                                    value={currentSituation}
                                    onChange={(e) => setCurrentSituation(e.target.value)}
                                    placeholder="Ex: Tenho nadado 3x por semana, sinto que a minha técnica de crawl está boa, mas canso-me depressa nos 100m."
                                    className="min-h-[100px]"
                                    disabled={isGenerating}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="improvement-goals">O que quer melhorar neste treino?</Label>
                                <Textarea
                                    id="improvement-goals"
                                    value={improvementGoals}
                                    onChange={(e) => setImprovementGoals(e.target.value)}
                                    placeholder="Ex: Quero melhorar a minha resistência aeróbica e a finalização da braçada de crawl."
                                    className="min-h-[100px]"
                                    disabled={isGenerating}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isGenerating}>
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        A gerar o seu treino...
                                    </>
                                ) : (
                                    'Gerar Treino'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                     {isGenerating && (
                        <Card className="shadow-md">
                            <CardHeader>
                                <Skeleton className="h-7 w-2/3" />
                                <Skeleton className="h-4 w-1/3 mt-2" />
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    )}
                    
                    {generatedWorkout && (
                        <Card className="shadow-md">
                             <CardHeader>
                                <CardTitle>{generatedWorkout.name}</CardTitle>
                                <CardDescription>Este é o plano de treino que a IA preparou para si.</CardDescription>
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
                                            {generatedWorkout.workoutItems.map((item, itemIndex) => (
                                                <TableRow key={itemIndex}>
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
                                 <Button onClick={() => handleSaveWorkout(generatedWorkout)} disabled={isSaving} className='mt-6 w-full'>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Salvar Treino
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
