'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import type { Workout, WorkoutItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AddWorkoutForm } from './add-workout-form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

const WorkoutRow = ({ workout, item, itemIndex }: { workout: Workout, item: WorkoutItem, itemIndex: number }) => {
    const firestore = useFirestore();
    const { user } = useUser();

    const debouncedUpdate = useDebouncedCallback((updatedItems) => {
        if (!user || !firestore) return;
        const workoutRef = doc(firestore, 'users', user.uid, 'workouts', workout.id);
        updateDoc(workoutRef, { workoutItems: updatedItems });
    }, 1000);

    const handleItemChange = (field: keyof WorkoutItem, value: any) => {
        if (!workout.workoutItems) return;
        const updatedItems = [...workout.workoutItems];
        updatedItems[itemIndex] = { ...updatedItems[itemIndex], [field]: value };
        debouncedUpdate(updatedItems);
    };

    const handleTimeChange = (timeIndex: number, value: string) => {
        if (!workout.workoutItems) return;
        const updatedItems = [...workout.workoutItems];
        const currentItem = updatedItems[itemIndex];
        const updatedTimes = { ...currentItem.temposRegistrados, [timeIndex]: value };
        updatedItems[itemIndex] = { ...currentItem, temposRegistrados: updatedTimes };
        debouncedUpdate(updatedItems);
    }
    
    const addRegisteredTime = () => {
        if (!workout.workoutItems) return;
        const updatedItems = [...workout.workoutItems];
        const currentItem = updatedItems[itemIndex];
        const nextTimeIndex = Object.keys(currentItem.temposRegistrados || {}).length;
        const updatedTimes = { ...currentItem.temposRegistrados, [nextTimeIndex]: '' };
        updatedItems[itemIndex] = { ...currentItem, temposRegistrados: updatedTimes };
        debouncedUpdate(updatedItems);
    }

    const handleDeleteTimeEntry = (timeIndex: number) => {
        if (!workout.workoutItems) return;
        const updatedItems = [...workout.workoutItems];
        const currentItem = updatedItems[itemIndex];
        const tempos = { ...currentItem.temposRegistrados };
        delete tempos[timeIndex];
        
        // Re-index the temposRegistrados
        const newTempos: Record<string, string> = {};
        Object.values(tempos).forEach((value, index) => {
            newTempos[index] = value;
        });

        updatedItems[itemIndex] = { ...currentItem, temposRegistrados: newTempos };
        debouncedUpdate(updatedItems);
    }
    
    const temposRegistradosCount = Object.keys(item.temposRegistrados || {}).length;
    const maxTemposInWorkout = workout.workoutItems?.reduce((max, item) => Math.max(max, Object.keys(item.temposRegistrados || {}).length), 0) || 0;

    return (
        <TableRow>
            <TableCell className="text-center p-1"><Input defaultValue={item.fase} onChange={(e) => handleItemChange('fase', e.target.value)} className="text-center" /></TableCell>
            <TableCell className="text-center p-1"><Input type="number" defaultValue={item.repeticoes} onChange={(e) => handleItemChange('repeticoes', parseInt(e.target.value))} className="text-center" /></TableCell>
            <TableCell className="text-center p-1 min-w-[300px]"><Input defaultValue={item.descricao} onChange={(e) => handleItemChange('descricao', e.target.value)} className="text-center" /></TableCell>
            <TableCell className="text-center p-1"><Input defaultValue={item.intensidade} onChange={(e) => handleItemChange('intensidade', e.target.value)} className="text-center" /></TableCell>
            <TableCell className="text-center p-1"><Input defaultValue={item.observacoes} onChange={(e) => handleItemChange('observacoes', e.target.value)} className="text-center" /></TableCell>
             {Array.from({ length: maxTemposInWorkout }).map((_, i) => (
                 <TableCell key={i} className="text-center p-1 align-top">
                    {i < temposRegistradosCount ? (
                        <div className='flex items-start'>
                             <Input 
                                defaultValue={item.temposRegistrados?.[i] || ''}
                                onChange={(e) => handleTimeChange(i, e.target.value)}
                                className="text-center" 
                            />
                             <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleDeleteTimeEntry(i)}>
                                <Trash2 className="h-4 w-4 text-destructive/70" />
                            </Button>
                        </div>
                    ) : (
                        <div className="h-10" /> 
                    )}
                </TableCell>
            ))}
            <TableCell className="text-center p-1">
                 <Button variant="ghost" size="icon" onClick={addRegisteredTime}><Plus className="h-4 w-4"/></Button>
            </TableCell>
        </TableRow>
    )
}

const WorkoutTable = ({ workout }: { workout: Workout }) => {
    const { user } = useUser();
    const firestore = useFirestore();

    const debouncedUpdate = useDebouncedCallback((updatedItems) => {
        if (!user || !firestore) return;
        const workoutRef = doc(firestore, 'users', user.uid, 'workouts', workout.id);
        updateDoc(workoutRef, { workoutItems: updatedItems });
    }, 1000);


    const addNewRow = () => {
        if (!user || !firestore) return;
        const workoutRef = doc(firestore, 'users', user.uid, 'workouts', workout.id);
        const newWorkoutItem: WorkoutItem = {
            fase: '',
            repeticoes: 0,
            descricao: '',
            intensidade: '',
            observacoes: '',
            temposRegistrados: { '0': '' }, // Start with one time column
        };
        const updatedItems = [...(workout.workoutItems || []), newWorkoutItem];
        updateDoc(workoutRef, { workoutItems: updatedItems });
    };

    const handleDeleteTimeColumn = (colIndex: number) => {
        if (!workout.workoutItems) return;
        
        const updatedItems = workout.workoutItems.map(item => {
            const tempos = { ...item.temposRegistrados };
            delete tempos[colIndex];
            
            // Re-index the temposRegistrados
            const newTempos: Record<string, string> = {};
            Object.values(tempos).forEach((value, index) => {
                newTempos[index] = value;
            });
            
            return { ...item, temposRegistrados: newTempos };
        });

        debouncedUpdate(updatedItems);
    }
    
    const maxTempos = workout.workoutItems?.reduce((max, item) => Math.max(max, Object.keys(item.temposRegistrados || {}).length), 0) || 1;

    return (
        <div className="p-2">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center bg-muted text-muted-foreground">Fase</TableHead>
                        <TableHead className="text-center bg-muted text-muted-foreground">Repetições</TableHead>
                        <TableHead className="text-center bg-muted text-muted-foreground min-w-[300px]">Descrição</TableHead>
                        <TableHead className="text-center bg-muted text-muted-foreground">Intensidade</TableHead>
                        <TableHead className="text-center bg-muted text-muted-foreground">Obs.</TableHead>
                        {Array.from({ length: maxTempos }).map((_, i) => (
                            <TableHead key={i} className="text-center bg-muted text-muted-foreground">
                                <div className='flex items-center justify-center gap-1'>
                                    <span>{i+1}º Tempo</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteTimeColumn(i)}>
                                        <Trash2 className="h-3 w-3 text-destructive/70" />
                                    </Button>
                                </div>
                            </TableHead>
                        ))}
                        <TableHead className="text-center bg-muted text-muted-foreground">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {workout.workoutItems?.map((item, index) => (
                        <WorkoutRow key={index} workout={workout} item={item} itemIndex={index} />
                    ))}
                </TableBody>
            </Table>
            <Button onClick={addNewRow} variant="outline" className="mt-4 w-full">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Linha
            </Button>
        </div>
    )
}


export default function WorkoutsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const workoutsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'workouts'), orderBy('date', 'desc'));
  }, [user, firestore]);

  const { data: workouts, isLoading } = useCollection<Workout>(workoutsQuery);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Treinos</h1>
        <AddWorkoutForm />
      </div>

       {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        ) : workouts && workouts.length > 0 ? (
             <Accordion type="single" collapsible className="w-full space-y-4">
                {workouts.map(workout => (
                     <AccordionItem value={workout.id} key={workout.id} className="border rounded-lg shadow-md bg-card">
                        <AccordionTrigger className="p-4">
                            <div className="flex justify-between w-full items-center">
                                <span className="font-bold text-lg">{workout.name}</span>
                                <span className="text-muted-foreground">{new Date(workout.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <WorkoutTable workout={workout} />
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        ) : (
            <div className="text-center py-12 text-muted-foreground">
                Nenhum treino registrado. Clique em "Novo Treino" para começar.
            </div>
        )}
    </div>
  );
}
